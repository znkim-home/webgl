import Shader from './Shader.js';
import Buffer from './Buffer.js';
import Camera from './Camera.js';
import FrameBufferObject from './funcional/FrameBufferObject.js';
import Rectangle from './Rectangle.js';
//import Polygon from './Polygon.js';
const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

Math.degree = (radian) => radian * 180 / Math.PI;
Math.radian = (degree) => degree * Math.PI / 180;
Array.prototype.get = function(index) {return this[this.loopIndex(index)]};
Array.prototype.getPrev = function(index) {return this[this.loopIndex(index - 1)]};
Array.prototype.getNext = function(index) {return this[this.loopIndex(index + 1)]};
Array.prototype.loopIndex = function(index) {
  if (index < 0) return index % this.length + this.length;
  else return index % this.length;
};

export default class WebGL {
  gl;
  shader;
  buffer;
  camera;
  canvas;
  renderableObjs;
  renderableObjsT;
  now;
  fovyDegree;

  constructor(canvas) {
    this.gl = undefined;
    this.shader = undefined;
    this.buffer = undefined;
    this.camera = undefined;
    this.canvas = canvas;
    this.renderableObjs = [];
    this.renderableObjsT = [];
    this.now = undefined;
    this.then = undefined;
    this.deltaTime = undefined;
    this.init();
  }

  init() {
    const canvas = this.canvas;
    try {
      this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch(e) {
      console.error(e);
      return;
    }
    if (!this.gl) {
      console.error("Unable to initialize WebGL. Your browser may not support it.");
      return;
    }
    const gl = this.gl;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  resizeCanvas() {
    const canvas = this.canvas;
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const needResize = (canvas.width !== displayWidth) || (canvas.height !== displayHeight);
    if (needResize) {
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
    return needResize;
  }

  startRender(data) {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this.shader = new Shader(gl);
    this.buffer = new Buffer(gl);
    this.shader.init(data.vertexShaderSource, data.fragmentShaderSource);
    this.buffer.init(data);
    this.camera = new Camera({
      fovyDegree : 75
    });
    this.camera.setPosition(0, 0, 0);
    this.camera.rotate(0, 0, 0);

    this.resizeCanvas();
    //const width = gl.canvas.width, height = gl.canvas.height;
    //const coordinates = [[-width, -height], [width, -height], [width, height], [-width, height]];

    //const coordinates = [[0.5, 0.5], [1, 0.5], [1, 1], [0.5, 1]];
    const coordinates = [[0, 0], [1, 0], [1, 1], [0, 1]];
    this.rectangle = new Rectangle(coordinates, {
      position: { x: 0, y: 0, z: 0 },
      color: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
      reverse : true,
    });

    requestAnimationFrame(this.render.bind(this));
  }

  render(now) {
    this.time(now);
    this.scene();
    requestAnimationFrame(this.render.bind(this));
  }
  
  time(now) {
    this.now = now;
    now *= 0.001;
    this.deltaTime = (now - this.then);
    this.then = now;
  }
  
  scene() {
    /** @type {WebGLRenderingContext} */
    const gl = this.gl;
    /** @type {HTMLCanvasElement} */
    const canvas = this.canvas;
    const shader = this.shader;
    const shaderInfo = shader.shaderInfo;
    const fbo = this.getFbo();

    this.resizeCanvas();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0.2, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.lineWidth(3);
    
    const fovy = Math.radian(this.camera.fovyDegree); // FieldOfView
    const aspect = canvas.width / canvas.height; // Aspect ratio
    const near = 0.1; // Near Frustum
    const far = 10000.0; // Far Frustum
    const pointSize = 8.0

    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fovy, aspect, near, far);
    let modelViewMatrix = this.camera.getModelViewMatrix();
    let normalMatrix = this.camera.getNormalMatrix();

    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniform1f(shaderInfo.uniformLocations.pointSize, pointSize);
    gl.uniform1i(shaderInfo.uniformLocations.fixedPosition, 0);

    fbo.bind();
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.renderableObjs.forEach((renderableObj) => {
      renderableObj.render(gl, shaderInfo);
    });
    fbo.unbind();

    /*this.renderableObjs.forEach((renderableObj) => {
      renderableObj.render(gl, shaderInfo);
    });*/

    gl.uniform1i(shaderInfo.uniformLocations.fixedPosition, 1);
    gl.disable(gl.DEPTH_TEST);
    this.rectangle.texture = fbo.texture;
    this.rectangle.render(gl, shaderInfo);

    //this.rectangle.texture = fbo.texture;
    //this.rectangle.render(gl, shaderInfo);
    gl.enable(gl.DEPTH_TEST);
  }

  getFbo() {
    if(!this.fbo) {
      let canvas = this.gl.canvas;
      this.fbo = new FrameBufferObject(this.gl, canvas.width, canvas.height);
    }
    return this.fbo;
  }

  get gl() {
    return this.gl;
  }
}