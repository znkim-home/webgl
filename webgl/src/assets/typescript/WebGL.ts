import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import Shader from './Shader.js';

import Camera from './Camera.js';
import Sun from './Sun.js';
import FrameBufferObject from './functional/FrameBufferObject.js';
import Renderable from './abstract/Renderable.js';
import RenderableObjectList from './functional/RenderableObjectList.js';

import { DefaultShader } from './shader/DefaultShader.js';
import DefaultShaderProcess from './shader/DefaultShaderProcess.js';
import { ScreenShader } from './shader/ScreenShader.js';
import ScreenShaderProcess from './shader/ScreenShaderProcess.js';
import { SkyBoxShader } from './shader/SkyBoxShader.js';
import SkyBoxShaderProcess from './shader/SkyBoxShaderProcess.js';

import { LightMapShader } from './shader/LightMapShader.js';
import LightMapShaderProcess from './shader/LightMapShaderProcess.js';
import SkyBox from './renderable/SkyBox.js';
import ShaderProcess from './abstract/ShaderProcess.js';

Math.degree = (radian) => radian * 180 / Math.PI;
Math.radian = (degree) => degree * Math.PI / 180;
Math.randomInt = () => Math.round(Math.random() * 10);
Array.prototype.get = function(index) {return this[this.loopIndex(index)]};
Array.prototype.getPrev = function(index) {return this[this.loopIndex(index - 1)]};
Array.prototype.getNext = function(index) {return this[this.loopIndex(index + 1)]};
Array.prototype.getPrevIndex = function(index) {return this.loopIndex(index - 1)};
Array.prototype.getNextIndex = function(index) {return this.loopIndex(index + 1)};
Array.prototype.loopIndex = function(index) {
  if (index < 0) return index % this.length + this.length;
  else return index % this.length;
};

export default class WebGL {
  _gl: WebGLRenderingContext | WebGL2RenderingContext;
  _canvas: HTMLCanvasElement;

  frameBufferObjs: Array<FrameBufferObject>;
  defaultFrameBufferObjs: Array<FrameBufferObject>;
  skyBoxFrameBufferObjs: Array<FrameBufferObject>;
  lightMapFrameBufferObjs: Array<FrameBufferObject>;

  renderableObjectList: RenderableObjectList;
  skyBoxObjectList: RenderableObjectList;

  shaderProcesses: Array<ShaderProcess>;
  globalOptions: GlobalOptions;

  defaultShader: Shader;
  defaultShaderInfo: ShaderInfoInterface;
  skyBoxShader: Shader;
  skyBoxShaderInfo: ShaderInfoInterface;
  lightMapShader: Shader;
  lightMapShaderInfo: ShaderInfoInterface;
  screenShader: Shader;
  screenShaderInfo: ShaderInfoInterface;

  camera: Camera;
  sun: Sun;

  albedoFbo: FrameBufferObject;
  selectionFbo: FrameBufferObject;
  mainFbo: FrameBufferObject;
  depthFbo: FrameBufferObject;
  normalFbo: FrameBufferObject;
  lightMapFbo: FrameBufferObject;
  skyBoxFbo: FrameBufferObject;

  _fps: any;
  constructor(canvas: HTMLCanvasElement, globalOptions: any = {}) {
    this.frameBufferObjs = [];
    this.defaultFrameBufferObjs = [];
    this.skyBoxFrameBufferObjs = [];
    this.lightMapFrameBufferObjs = [];
    this._fps = {
      then : 0,
      frame : 0,
      frames : [],
    }
    this.renderableObjectList = new RenderableObjectList();
    this.skyBoxObjectList = new RenderableObjectList();
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
        version = "webgl 2";
      } else if (canvas.getContext("webgl")) {
        this.gl = <WebGLRenderingContext> canvas.getContext("webgl");
        version = "webgl 1";
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
    
    this.skyBoxShader = new Shader(gl);
    this.skyBoxShader.init(SkyBoxShader);
    this.skyBoxShaderInfo = this.skyBoxShader.shaderInfo;

    this.camera = new Camera({fovyDegree : this.globalOptions.fovyDegree});
    if (!Renderable.globalOptions) Renderable.globalOptions = this.globalOptions;

    let radius = 6378137 * 1.1;
    this.sun = new Sun({
      position: {x: 0, y: 0, z: radius},
      radius: radius,
    });
    this.sun.rotationOrbit(0.7853, 0.7853, vec3.fromValues(0,0,0));

    let skyBoxImageList: Array<any> = [
      { index : 0, path : "/image/skyboxes/space/right.png", loadedImage : undefined},
      { index : 1, path : "/image/skyboxes/space/left.png", loadedImage : undefined},
      { index : 2, path : "/image/skyboxes/space/front.png", loadedImage : undefined},
      { index : 3, path : "/image/skyboxes/space/back.png", loadedImage : undefined},
      { index : 4, path : "/image/skyboxes/space/bottom.png", loadedImage : undefined},
      { index : 5, path : "/image/skyboxes/space/top.png", loadedImage : undefined},
    ];
    let loadedCount = 0;
    skyBoxImageList.forEach((texture, index) => {
      let image = new Image(); 
      image.onload = () => {
        skyBoxImageList[index].loadedImage = image;
        loadedCount++;
        if (skyBoxImageList.length == loadedCount) {
          let skybox = new SkyBox({
            id : 8613,
            position: { x: 0, y: 0, z: 0},
            color: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
            images : skyBoxImageList,
            size: { width: 1000000000, height:1000000000, length:1000000000 }
          });
          this.skyBoxObjectList.push(skybox);
        }
      }
      image.src = texture.path;
    })

    this.frameBufferObjs.push(this.getMainFbo());
    this.frameBufferObjs.push(this.getAlbedoFbo());
    this.frameBufferObjs.push(this.getSelectionFbo());
    this.frameBufferObjs.push(this.getNormalFbo());
    this.frameBufferObjs.push(this.getDepthFbo());
    this.frameBufferObjs.push(this.getSkyBoxFbo());
    this.frameBufferObjs.push(this.getLightMapFbo());

    this.defaultFrameBufferObjs = [];
    this.defaultFrameBufferObjs.push(this.getMainFbo());
    this.defaultFrameBufferObjs.push(this.getAlbedoFbo());
    this.defaultFrameBufferObjs.push(this.getSelectionFbo());
    this.defaultFrameBufferObjs.push(this.getNormalFbo());
    this.defaultFrameBufferObjs.push(this.getDepthFbo());

    this.skyBoxFrameBufferObjs = [];
    this.skyBoxFrameBufferObjs.push(this.getSkyBoxFbo());

    this.lightMapFrameBufferObjs.push(this.getLightMapFbo());

    let forSceenFrameBufferObjs: FrameBufferObject[] = [];
    forSceenFrameBufferObjs.push(this.getMainFbo());
    forSceenFrameBufferObjs.push(this.getAlbedoFbo());
    forSceenFrameBufferObjs.push(this.getSelectionFbo());
    forSceenFrameBufferObjs.push(this.getNormalFbo());
    forSceenFrameBufferObjs.push(this.getDepthFbo());
    forSceenFrameBufferObjs.push(this.getSkyBoxFbo());
    forSceenFrameBufferObjs.push(this.getLightMapFbo());

    this.shaderProcesses.push(new DefaultShaderProcess(gl, this.defaultShader, this.globalOptions, this.camera, this.defaultFrameBufferObjs, this.renderableObjectList));
    this.shaderProcesses.push(new SkyBoxShaderProcess(gl, this.skyBoxShader, this.globalOptions, this.camera, this.skyBoxFrameBufferObjs, this.skyBoxObjectList));
    this.shaderProcesses.push(new LightMapShaderProcess(gl, this.lightMapShader, this.globalOptions, this.camera, this.lightMapFrameBufferObjs, this.renderableObjectList, this.sun));
    this.shaderProcesses.push(new ScreenShaderProcess(gl, this.screenShader, this.globalOptions, this.camera, forSceenFrameBufferObjs, this.sun));

    this.shaderProcesses.forEach((shaderProcess) => {
      shaderProcess.preprocess();
    });
    this.render(0);
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
    if (this.globalOptions.wireFrame) {
      this.globalOptions.drawElementsType = this.gl.LINES;
    } else {
      this.globalOptions.drawElementsType = this.gl.TRIANGLES;
    }
  }
  render(now: number) {
    now *= 0.001
    const avgCount = 10;
    const fpsObject = this._fps;
    const deltaTime = now - fpsObject.then;
    fpsObject.then = now;
    let frame = 1 / deltaTime;
    fpsObject.frames.push(frame);
    fpsObject.frames = fpsObject.frames.slice(-avgCount);
    fpsObject.frame = fpsObject.frames.reduce((a: number, b: number) => a + b) / fpsObject.frames.length;

    fpsObject.frame = Math.round(fpsObject.frame * 10) / 10;
    fpsObject.frame = fpsObject.frame.toFixed(1);

    fpsObject.cameraPosition = this.camera.position;
    
    this.scene();
    requestAnimationFrame(this.render.bind(this));
  }
  scene() {
    this.setOptions();
    this.shaderProcesses.forEach((shaderProcess) => {
      shaderProcess.process();
    });
    this.shaderProcesses.forEach((shaderProcess) => {
      shaderProcess.postprocess();
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
    const clearColor = vec3.fromValues(1.0, 1.0, 1.0);
    if (!this.albedoFbo) {
      this.albedoFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, {name:"albedo" , textureType, clearColor}, this.globalOptions);
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
  getSelectionGroupFbo() {
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
      this.lightMapFbo = new FrameBufferObject(this.gl, this.canvas, this.lightMapShaderInfo, {
        name:"light" , 
        textureType : textureType,
        width : 4096,
        height : 4096,
    }, this.globalOptions);
    }
    return this.lightMapFbo;
  }
  getSkyBoxFbo() {
    if (!this.skyBoxFbo) {
      this.skyBoxFbo = new FrameBufferObject(this.gl, this.canvas, this.skyBoxShaderInfo, {name:"skybox"}, this.globalOptions);
    }
    return this.skyBoxFbo;
  }
  get fps(): any {
    return this._fps;
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