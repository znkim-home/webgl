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
  
  colorFbo;
  depthFbo;

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

    const normalCoorinates = [[0.75, 0.25], [1, 0.25], [1, 0.5], [0.75, 0.5]];
    this.normalRectangle = new Rectangle(normalCoorinates, {
      position: { x: 0, y: 0, z: 0 },
      color: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
      reverse : true,
    });
    const selectionCoorinates = [[0.75, 0.75], [1, 0.75], [1, 1], [0.75, 1]];
    this.selectionRectangle = new Rectangle(selectionCoorinates, {
      position: { x: 0, y: 0, z: 0 },
      color: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
      reverse : true,
    });
    const depthCoorinates = [[0.75, 0.5], [1, 0.5], [1, 0.75], [0.75, 0.75]];
    this.depthRectangle = new Rectangle(depthCoorinates, {
      position: { x: 0, y: 0, z: 0 },
      color: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
      reverse : true,
    });
    const albedoCoordinates = [[0, 0], [1, 0], [1, 1], [0, 1]];
    this.albedoRectangle = new Rectangle(albedoCoordinates, {
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
    const albedoFbo = this.getAlbedoFbo();
    const selectionFbo = this.getSelectionFbo();
    const depthFbo = this.getDepthFbo();
    const normalFbo = this.getNormalFbo();

    this.resizeCanvas();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.lineWidth(3);
    
    const fovy = Math.radian(this.camera.fovyDegree); // FieldOfView
    const aspect = canvas.width / canvas.height; // Aspect ratio
    const near = 0.1; // Near Frustum
    const far = 10000.0; // Far Frustum
    const pointSize = 16.0

    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fovy, aspect, near, far);
    let modelViewMatrix = this.camera.getModelViewMatrix();
    let normalMatrix = this.camera.getNormalMatrix();

    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniform1f(shaderInfo.uniformLocations.pointSize, pointSize);
    gl.uniform1i(shaderInfo.uniformLocations.positionType, 0);

    albedoFbo.bind();
    gl.clearColor(0.3, 0.3, 0.3, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.renderableObjs.forEach((renderableObj, index) => {
      let id = renderableObj.getId();
      if (id === undefined) {
        id = index;
        renderableObj.id = id;
        let color = renderableObj.convertIdToColor(id);
        renderableObj.selectionColor = vec4.fromValues(color[0], color[1], color[2], color[3]);
        renderableObj.dirty = true;
      }
      renderableObj.render(gl, shaderInfo);
    });
    albedoFbo.unbind();

    selectionFbo.bind();
    gl.clearColor(1.0, 1.0, 1.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.renderableObjs.forEach((renderableObj) => {
      renderableObj.render(gl, shaderInfo, {textureType : 4});
    });
    selectionFbo.unbind();

    depthFbo.bind();
    gl.clearColor(1.0, 1.0, 1.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1i(shaderInfo.uniformLocations.positionType, 2);
    this.renderableObjs.forEach((renderableObj) => {
      renderableObj.render(gl, shaderInfo, {textureType : 3});
    });
    depthFbo.unbind();

    normalFbo.bind();
    gl.clearColor(1.0, 1.0, 1.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1i(shaderInfo.uniformLocations.positionType, 3);
    this.renderableObjs.forEach((renderableObj) => {
      renderableObj.render(gl, shaderInfo, {textureType : 5});
    });
    normalFbo.unbind();

    gl.uniform1i(shaderInfo.uniformLocations.positionType, 1);
    gl.disable(gl.DEPTH_TEST);
    this.albedoRectangle.texture = albedoFbo.texture;
    this.albedoRectangle.render(gl, shaderInfo);
    this.selectionRectangle.texture = selectionFbo.texture;
    this.selectionRectangle.render(gl, shaderInfo);
    this.depthRectangle.texture = depthFbo.texture;
    this.depthRectangle.render(gl, shaderInfo);
    this.normalRectangle.texture = normalFbo.texture;
    this.normalRectangle.render(gl, shaderInfo);
    gl.enable(gl.DEPTH_TEST);
  }
  getAlbedoFbo() {
    if(!this.colorFbo) {
      let canvas = this.gl.canvas;
      this.colorFbo = new FrameBufferObject(this.gl, canvas.width, canvas.height);
    }
    return this.colorFbo;
  }
  getSelectionFbo() {
    if(!this.selectionFbo) {
      let canvas = this.gl.canvas;
      this.selectionFbo = new FrameBufferObject(this.gl, canvas.width, canvas.height);
    }
    return this.selectionFbo;
  }
  getDepthFbo() {
    if(!this.depthFbo) {
      let canvas = this.gl.canvas;
      this.depthFbo = new FrameBufferObject(this.gl, canvas.width, canvas.height);
    }
    return this.depthFbo;
  }

  getNormalFbo() {
    if(!this.normalFbo) {
      let canvas = this.gl.canvas;
      this.normalFbo = new FrameBufferObject(this.gl, canvas.width, canvas.height);
    }
    return this.normalFbo;
  }

  get gl() {
    return this.gl;
  }
}