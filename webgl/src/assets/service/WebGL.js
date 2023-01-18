const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars
import Shader from './Shader.js';
import { DefaultShader } from '../shader/DefaultShader.js';
import { ScreenShader } from '../shader/ScreenShader.js';
import { LightMapShader } from '../shader/LightMapShader.js';

import Camera from './Camera.js';
import Sun from './Sun.js';
import FrameBufferObject from './funcional/FrameBufferObject.js';

import DefaultShaderProcess from './DefaultShaderProcess.js';
import ScreenShaderProcess from './ScreenShaderProcess.js';
import LightMapShaderProcess from './LightMapShaderProcess.js';
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
  constructor(canvas, globalOptions = {}) {
    this.frameBufferObjs = [];
    this.defaultFrameBufferObjs = [];
    this.lightMapFrameBufferObjs = [];

    this.renderableObjectList = new RenderableObjectList();
    this.shaderProcesses = [];
    this.globalOptions = globalOptions;
    this.init(canvas);
  }
  init(canvas) {
    console.log("Init Start WebGL.");
    let version = "";
    try {
      this.canvas = canvas;
      if (canvas.getContext("webgl2")) {
        this.gl = canvas.getContext("webgl2");
        version = "webgl2";
      } else if (canvas.getContext("webgl")) {
        this.gl = canvas.getContext("webgl");
        version = "webgl";
      } else if (canvas.getContext("experimental-webgl")) {
        this.gl = canvas.getContext("experimental-webgl");
        version = "experimental-webgl";
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
    //this.buffer = new Buffer(gl);
    this.resizeCanvas();

    this.defaultShader = new Shader(gl);
    this.defaultShader.init(DefaultShader);
    this.defaultShaderInfo = this.defaultShader.shaderInfo;

    this.screenShader = new Shader(gl);
    this.screenShader.init(ScreenShader);
    this.screenShaderInfo = this.screenShader.shaderInfo;

    this.lightMapShader = new Shader(gl);
    this.lightMapShader.init(LightMapShader);
    this.lightMapShaderInfo = this.lightMapShader.shaderInfo;
    
    this.camera = new Camera({fovyDegree : this.globalOptions.fovyDegree});

    this.sun = new Sun({position:{x:0, y:0, z: 8192 / 2}});
    //this.sun.setPosition(0,0,0);
    //this.sun.moveForward(1024);
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

    this.shaderProcesses.push(new DefaultShaderProcess(gl, this.defaultShader, this.camera, this.defaultFrameBufferObjs, this.renderableObjectList));
    this.shaderProcesses.push(new LightMapShaderProcess(gl, this.lightMapShader, this.camera, this.lightMapFrameBufferObjs, this.renderableObjectList, this.sun));
    this.shaderProcesses.push(new ScreenShaderProcess(gl, this.screenShader, this.camera, this.frameBufferObjs, this.sun));

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
      this.mainFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {name:"main" ,textureType, clearColor}, this.globalOptions);
    }
    return this.mainFbo;
  }
  getAlbedoFbo() {
    const textureType = 1;
    if (!this.albedoFbo) {
      this.albedoFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {name:"albedo" ,textureType}, this.globalOptions);
    }
    return this.albedoFbo;
  }
  getSelectionFbo() {
    const textureType = 2;
    if (!this.selectionFbo) {
      this.selectionFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {name:"selection" ,textureType}, this.globalOptions);
    }
    return this.selectionFbo;
  }
  getDepthFbo() {
    const textureType = 3;
    if (!this.depthFbo) {
      this.depthFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {name:"depth" ,textureType}, this.globalOptions);
    }
    return this.depthFbo;
  }
  getNormalFbo() {
    const textureType = 4;
    if (!this.normalFbo) {
      this.normalFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {name:"normal" ,textureType}, this.globalOptions);
    }
    return this.normalFbo;
  }
  getLightMapFbo() {
    const textureType = 5;
    if (!this.lightMapFbo) {
      this.lightMapFbo = new FrameBufferObject(this.gl, this.gl.canvas, this.defaultShaderInfo, {
        name:"light" , 
        textureType : textureType,
        width : 8182,
        height : 8182,
    }, this.globalOptions);
    }
    return this.lightMapFbo;
  }
  get gl() {
    return this.gl;
  }
}