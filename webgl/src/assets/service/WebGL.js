const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars
import Shader from './Shader.js';
import { DefaultShader } from '../shader/DefaultShader.js';
import { ScreenShader } from '../shader/ScreenShader.js';
import Buffer from './Buffer.js';
import Camera from './Camera.js';
import FrameBufferObject from './funcional/FrameBufferObject.js';

import DefaultShaderProcess from './DefaultShaderProcess.js';
import ScreenShaderProcess from './ScreenShaderProcess.js';
import RenderableObjectList from './funcional/RenderableObjectList.js';


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
  shaderProcesses;
  frameBufferObjs;
  renderableObjectList;
  globalOptions;

  albedoFbo;
  selectionFbo;
  depthFbo;
  normalFbo;
  constructor(canvas) {
    this.frameBufferObjs = [];
    this.renderableObjectList = new RenderableObjectList();
    this.shaderProcesses = [];
    this.globalOptions = {
      fovyDegree : 70,
      aspect : undefined,
      near : 0.1,
      far : 10000.0,
      pointSize : 16.0,
      lineWidth : 3.0,
      debugMode : false,
    }
    this.init(canvas);
  }
  init(canvas) {
    try {
      this.canvas = canvas;
      this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!this.gl) {
        throw new Error("Unable to initialize WebGL. Your browser may not support it.");
      }
    } catch(e) {
      console.error(e);
    }
  }
  resizeCanvas() {
    const canvas = this.canvas;
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const isChanged = (canvas.width !== displayWidth) || (canvas.height !== displayHeight);
    if (isChanged) {
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
      this.frameBufferObjs.forEach((frameBufferObj) => {
        frameBufferObj.init();
      });
    }
    this.globalOptions.aspect = (canvas.width / canvas.height);
    return isChanged;
  }
  startRender() {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this.buffer = new Buffer(gl);
    //this.buffer.init();
    this.resizeCanvas();

    this.defaultShader = new Shader(gl);
    this.defaultShader.init(DefaultShader);
    this.defaultShaderInfo = this.defaultShader.shaderInfo;
    this.screenShader = new Shader(gl);
    this.screenShader.init(ScreenShader);
    this.screenShaderInfo = this.screenShader.shaderInfo;
    
    this.camera = new Camera({fovyDegree : this.globalOptions.fovyDegree});

    this.frameBufferObjs.push(this.getMainFbo());
    this.frameBufferObjs.push(this.getAlbedoFbo());
    this.frameBufferObjs.push(this.getSelectionFbo());
    this.frameBufferObjs.push(this.getNormalFbo());
    this.frameBufferObjs.push(this.getDepthFbo());

    this.shaderProcesses.push(new DefaultShaderProcess(gl, this.defaultShader, this.camera, this.frameBufferObjs, this.renderableObjectList));
    this.shaderProcesses.push(new ScreenShaderProcess(gl, this.screenShader, this.camera, this.frameBufferObjs));
    this.shaderProcesses.forEach((shaderProcess) => {
      shaderProcess.preprocess();
    });
    this.render();
  }
  render() {
    this.scene();
    requestAnimationFrame(this.render.bind(this));
  }
  scene() {
    this.resizeCanvas();
    this.shaderProcesses.forEach((shaderProcess) => {
      shaderProcess.process(this.globalOptions);
    });
    this.shaderProcesses.forEach((shaderProcess) => {
      shaderProcess.postprocess(this.globalOptions);
    });
  }
  getMainFbo() {
    const positionType = 0;
    const textureType = 1;
    const clearColor = vec3.fromValues(0.2, 0.2, 0.2);
    if (!this.mainFbo) {
      this.mainFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {positionType, textureType, clearColor});
    }
    return this.mainFbo;
  }
  getAlbedoFbo() {
    const positionType = 0;
    const textureType = 1;
    if (!this.albedoFbo) {
      this.albedoFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {positionType, textureType});
    }
    return this.albedoFbo;
  }
  getSelectionFbo() {
    const positionType = 0;
    const textureType = 4;
    if (!this.selectionFbo) {
      this.selectionFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {positionType, textureType});
    }
    return this.selectionFbo;
  }
  getDepthFbo() {
    const positionType = 2;
    const textureType = 3;
    if (!this.depthFbo) {
      this.depthFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {positionType, textureType});
    }
    return this.depthFbo;
  }
  getNormalFbo() {
    const positionType = 0;
    const textureType = 5;
    if (!this.normalFbo) {
      this.normalFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {positionType, textureType});
    }
    return this.normalFbo;
  }
  get gl() {
    return this.gl;
  }
}