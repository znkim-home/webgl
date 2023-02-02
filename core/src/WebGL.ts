import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import Shader from './Shader.js';

import Camera from './Camera.js';
import Sun from './Sun.js';
import FrameBufferObject from './functional/FrameBufferObject.js';
import RenderableObjectList from './functional/RenderableObjectList.js';

import { DefaultShader } from './shader/DefaultShader.js';
import DefaultShaderProcess from './shader/DefaultShaderProcess.js';
import { ScreenShader } from './shader/ScreenShader.js';
import ScreenShaderProcess from './shader/ScreenShaderProcess.js';
import { LightMapShader } from './shader/LightMapShader.js';
import LightMapShaderProcess from './shader/LightMapShaderProcess.js';

Math.degree = (radian) => radian * 180 / Math.PI;
Math.radian = (degree) => degree * Math.PI / 180;
Math.randomInt = () => Math.round(Math.random() * 10);
Array.prototype.get = function(index) {return this[this.loopIndex(index)]};
Array.prototype.getPrev = function(index) {return this[this.loopIndex(index - 1)]};
Array.prototype.getNext = function(index) {return this[this.loopIndex(index + 1)]};
Array.prototype.loopIndex = function(index) {
  if (index < 0) return index % this.length + this.length;
  else return index % this.length;
};

export default class WebGL {
  _gl: WebGLRenderingContext | WebGL2RenderingContext;
  _canvas: HTMLCanvasElement;
  frameBufferObjs: Array<any>;
  defaultFrameBufferObjs: Array<any>;
  lightMapFrameBufferObjs: Array<any>;
  renderableObjectList: RenderableListInterface;
  shaderProcesses: Array<any>;
  globalOptions: any;

  defaultShaderInfo: ShaderInfoInterface;
  lightMapShaderInfo: ShaderInfoInterface;
  screenShaderInfo: ShaderInfoInterface;

  camera: Camera;
  sun: Sun;
  defaultShader: Shader;
  lightMapShader: Shader;
  screenShader: Shader;

  albedoFbo: FrameBufferObject;
  selectionFbo: FrameBufferObject;
  mainFbo: FrameBufferObject;
  depthFbo: FrameBufferObject;
  normalFbo: FrameBufferObject;
  lightMapFbo: FrameBufferObject;

  constructor(canvas: HTMLCanvasElement, globalOptions: any = {}) {
    this.frameBufferObjs = [];
    this.defaultFrameBufferObjs = [];
    this.lightMapFrameBufferObjs = [];

    this.renderableObjectList = new RenderableObjectList();
    this.shaderProcesses = [];
    this.globalOptions = globalOptions;
    this._canvas = canvas;
    this.init();
  }
  init() {
    console.log("Init Start WebGL.");
    let version = "";
    try {
      let canvas = this._canvas;
      if (canvas.getContext("webgl2")) {
        this.gl = <WebGL2RenderingContext> canvas.getContext("webgl2");
        version = "webgl2";
      } else if (canvas.getContext("webgl")) {
        this.gl = <WebGLRenderingContext> canvas.getContext("webgl");
        version = "webgl";
      }
      if (!this.gl) {
        throw new Error("Unable to initialize WebGL. Your browser may not support it.");
      }
    } catch(e) {
      console.log("Unable to initialize WebGL. Your browser may not support it.");
      console.error(e);
    }
    console.log("Init Success " + version);
  }
  checkMultiRenders() {
    const ext = this._gl.getExtension('WEBGL_draw_buffers');
    return !ext;
  }
  resizeCanvas() {
    const canvas = this.canvas;
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const isChanged = (canvas.width !== displayWidth) || (canvas.height !== displayHeight);
    if (isChanged) {
      canvas.width  = displayWidth ;
      canvas.height = displayHeight;
      this.frameBufferObjs.forEach((frameBufferObj) => {
        if (!frameBufferObj.options.isNotInit) {
          frameBufferObj.init();
        }
      });
      console.log("resizeCanvas");
    }
    this.globalOptions.aspect = (canvas.width / canvas.height);
    return isChanged;
  }
  startRender() {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this.resizeCanvas();

    this.defaultShader = new Shader(gl);
    if (this.checkMultiRenders()) {
      this.defaultShader.init(DefaultShader);
    }
    this.defaultShaderInfo = this.defaultShader.shaderInfo;

    this.screenShader = new Shader(gl);
    this.screenShader.init(ScreenShader);
    this.screenShaderInfo = this.screenShader.shaderInfo;

    this.lightMapShader = new Shader(gl);
    this.lightMapShader.init(LightMapShader);
    this.lightMapShaderInfo = this.lightMapShader.shaderInfo;
    
    this.camera = new Camera({fovyDegree : this.globalOptions.fovyDegree});

    this.sun = new Sun({position:{x:0, y:0, z: 8192 / 2}});
    this.sun.rotationOrbit(0.5, 0.8, vec3.fromValues(0,0,0));

    this.frameBufferObjs.push(this.getMainFbo());
    this.frameBufferObjs.push(this.getAlbedoFbo());
    this.frameBufferObjs.push(this.getSelectionFbo());
    this.frameBufferObjs.push(this.getNormalFbo());
    this.frameBufferObjs.push(this.getDepthFbo());
    this.frameBufferObjs.push(this.getLightMapFbo());

    this.defaultFrameBufferObjs = [];
    this.defaultFrameBufferObjs.push(this.getMainFbo());
    this.defaultFrameBufferObjs.push(this.getAlbedoFbo());
    this.defaultFrameBufferObjs.push(this.getSelectionFbo());
    this.defaultFrameBufferObjs.push(this.getNormalFbo());
    this.defaultFrameBufferObjs.push(this.getDepthFbo());
    this.lightMapFrameBufferObjs.push(this.getLightMapFbo());

    this.shaderProcesses.push(new DefaultShaderProcess(gl, this.defaultShader, this.globalOptions, this.camera, this.defaultFrameBufferObjs, this.renderableObjectList));
    this.shaderProcesses.push(new LightMapShaderProcess(gl, this.lightMapShader, this.globalOptions, this.camera, this.lightMapFrameBufferObjs, this.renderableObjectList, this.sun));
    this.shaderProcesses.push(new ScreenShaderProcess(gl, this.screenShader, this.globalOptions, this.camera, this.frameBufferObjs, this.sun));

    this.shaderProcesses.forEach((shaderProcess) => {
      shaderProcess.preprocess();
    });
    this.render();
  }
  setOptions() {
    this.resizeCanvas();
    this.camera.syncFovyDegree(this.globalOptions.fovyDegree);
    if (this.globalOptions.cullFace) {
      this.gl.enable(this.gl.CULL_FACE);
    } else {
      this.gl.disable(this.gl.CULL_FACE);
    }
    if (this.globalOptions.depthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
    } else {
      this.gl.disable(this.gl.DEPTH_TEST);
    }
  }
  render() {
    this.scene();
    requestAnimationFrame(this.render.bind(this));
  }
  scene() {
    this.setOptions();
    this.shaderProcesses.forEach((shaderProcess) => {
      shaderProcess.process(this.globalOptions);
    });
    this.shaderProcesses.forEach((shaderProcess) => {
      shaderProcess.postprocess(this.globalOptions);
    });
  }
  getMainFbo() {
    const textureType = 1;
    const clearColor = vec3.fromValues(0.2, 0.2, 0.2);
    if (!this.mainFbo) {
      this.mainFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, {name:"main" ,textureType, clearColor}, this.globalOptions);
    }
    return this.mainFbo;
  }
  getAlbedoFbo() {
    const textureType = 1;
    if (!this.albedoFbo) {
      this.albedoFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, {name:"albedo" ,textureType}, this.globalOptions);
    }
    return this.albedoFbo;
  }
  getSelectionFbo() {
    const textureType = 2;
    if (!this.selectionFbo) {
      this.selectionFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, {name:"selection" ,textureType}, this.globalOptions);
    }
    return this.selectionFbo;
  }
  getDepthFbo() {
    const textureType = 3;
    if (!this.depthFbo) {
      this.depthFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, {name:"depth" ,textureType}, this.globalOptions);
    }
    return this.depthFbo;
  }
  getNormalFbo() {
    const textureType = 4;
    if (!this.normalFbo) {
      this.normalFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, {name:"normal" ,textureType}, this.globalOptions);
    }
    return this.normalFbo;
  }
  getLightMapFbo() {
    const textureType = 5;
    if (!this.lightMapFbo) {
      this.lightMapFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, {
        name:"light" , 
        textureType : textureType,
        width : 8182,
        height : 8182,
    }, this.globalOptions);
    }
    return this.lightMapFbo;
  }

  get gl(): WebGLRenderingContext | WebGL2RenderingContext {
    return this._gl;
  }
  set gl(setgl: WebGLRenderingContext | WebGL2RenderingContext) {
    this._gl = setgl;
  }
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }
  set canvas(setcanvas) {
    this._canvas = setcanvas;
  }
}