const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars
import Shader from './Shader.js';
import Buffer from './Buffer.js';
import Camera from './Camera.js';
import FrameBufferObject from './funcional/FrameBufferObject.js';
import Rectangle from './Rectangle.js';

Math.degree = (radian) => radian * 180 / Math.PI;
Math.radian = (degree) => degree * Math.PI / 180;
Math.randomInt = () => Math.ceil(Math.random() * 10);
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
  frameBufferObjs;
  renderableObjs;
  globalOptions;

  albedoFbo;
  selectionFbo;
  depthFbo;
  normalFbo;

  constructor(canvas) {
    //this.gl = undefined;
    //this.shader = undefined;
    //this.buffer = undefined;
    //this.camera = undefined;
    this.canvas = canvas;
    this.frameBufferObjs = [];
    this.renderableObjs = [];
    this.globalOptions = {
      fovyDegree : 90,
      aspect : undefined,
      near : 0.1,
      far : 10000.0,
      pointSize : 8.0,
      lineWidth : 3.0,
    }
    this.init();
  }
  init() {
    try {
      const canvas = this.canvas;
      this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch(e) {
      console.error(e);
      return;
    }
    if (!this.gl) {
      console.error("Unable to initialize WebGL. Your browser may not support it.");
      return;
    }
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
    this.globalOptions.aspect = (canvas.width / canvas.height);
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
    this.shaderInfo = this.shader.shaderInfo;
    this.camera = new Camera({fovyDegree : this.globalOptions.fovyDegree});
    this.resizeCanvas();

    const albedoCoordinates = [[0, 0], [1, 0], [1, 1], [0, 1]];
    this.albedoRectangle = new Rectangle(albedoCoordinates, {reverse : true});
    const selectionCoorinates = [[0.75, 0.75], [1, 0.75], [1, 1], [0.75, 1]];
    this.selectionRectangle = new Rectangle(selectionCoorinates, {reverse : true});
    const normalCoorinates = [[0.75, 0.25], [1, 0.25], [1, 0.5], [0.75, 0.5]];
    this.normalRectangle = new Rectangle(normalCoorinates, {reverse : true});
    const depthCoorinates = [[0.75, 0.5], [1, 0.5], [1, 0.75], [0.75, 0.75]];
    this.depthRectangle = new Rectangle(depthCoorinates, {reverse : true});    
    
    this.frameBufferObjs.push(this.getAlbedoFbo());
    this.frameBufferObjs.push(this.getSelectionFbo());
    this.frameBufferObjs.push(this.getDepthFbo());
    this.frameBufferObjs.push(this.getNormalFbo());

    requestAnimationFrame(this.render.bind(this));
  }
  render() {
    this.scene();
    requestAnimationFrame(this.render.bind(this));
  }
  scene() {
    /** @type {WebGLRenderingContext} */
    const gl = this.gl;
    /** @type {HTMLCanvasElement} */
    const canvas = this.canvas;
    const shaderInfo = this.shaderInfo;
    const frameBufferObjs = this.frameBufferObjs;
    const globalOptions = this.globalOptions;

    this.resizeCanvas();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.lineWidth(globalOptions.lineWidth);
    
    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);
    let modelViewMatrix = this.camera.getModelViewMatrix();
    let normalMatrix = this.camera.getNormalMatrix();

    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniform1f(shaderInfo.uniformLocations.pointSize, globalOptions.pointSize);
    gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
    gl.uniform1i(shaderInfo.uniformLocations.positionType, 0);
    
    frameBufferObjs.forEach((frameBufferObj) => {
      frameBufferObj.clear();
    });
    this.renderableObjs.forEach((renderableObj) => {
      (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(this.renderableObjs) : undefined;
      renderableObj.render(gl, shaderInfo, frameBufferObjs);
    });
    this.drawFrameBufferObjs();
  }
  drawFrameBufferObjs() {
    const gl = this.gl;
    const shaderInfo = this.shaderInfo;
    const albedoFbo = this.getAlbedoFbo();
    const selectionFbo = this.getSelectionFbo();
    const depthFbo = this.getDepthFbo();
    const normalFbo = this.getNormalFbo();
    gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
    gl.uniform1i(shaderInfo.uniformLocations.positionType, 1);
    gl.disable(gl.DEPTH_TEST);
    this.albedoRectangle.texture = albedoFbo.texture;
    this.albedoRectangle.render(gl, shaderInfo, undefined);
    this.selectionRectangle.texture = selectionFbo.texture;
    this.selectionRectangle.render(gl, shaderInfo, undefined);
    this.depthRectangle.texture = depthFbo.texture;
    this.depthRectangle.render(gl, shaderInfo, undefined);
    this.normalRectangle.texture = normalFbo.texture;
    this.normalRectangle.render(gl, shaderInfo, undefined);
    gl.enable(gl.DEPTH_TEST);
  }
  getAlbedoFbo() {
    if (!this.albedoFbo) {
      this.albedoFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.shaderInfo, {
        positionType : 0,
        textureType : 1,
        clearColor : vec3.fromValues(0.5, 0.5, 0.5)
      });
    }
    return this.albedoFbo;
  }
  getSelectionFbo() {
    if (!this.selectionFbo) {
      this.selectionFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.shaderInfo, {
        positionType : 0,
        textureType : 4,
      });
    }
    return this.selectionFbo;
  }
  getDepthFbo() {
    if (!this.depthFbo) {
      this.depthFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.shaderInfo, {
        positionType : 2,
        textureType : 3,
      });
    }
    return this.depthFbo;
  }
  getNormalFbo() {
    if (!this.normalFbo) {
      this.normalFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.shaderInfo, {
        positionType : 3,
        textureType : 5,
      });
    }
    return this.normalFbo;
  }
  get gl() {
    return this.gl;
  }
}