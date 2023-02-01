"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix"); // eslint-disable-line no-unused-vars
const Shader_js_1 = __importDefault(require("./Shader.js"));
const Camera_js_1 = __importDefault(require("./Camera.js"));
const Sun_js_1 = __importDefault(require("./Sun.js"));
const FrameBufferObject_js_1 = __importDefault(require("./functional/FrameBufferObject.js"));
const RenderableObjectList_js_1 = __importDefault(require("./functional/RenderableObjectList.js"));
const DefaultShader_js_1 = require("./shader/DefaultShader.js");
const DefaultShaderProcess_js_1 = __importDefault(require("./shader/DefaultShaderProcess.js"));
const ScreenShader_js_1 = require("./shader/ScreenShader.js");
const ScreenShaderProcess_js_1 = __importDefault(require("./shader/ScreenShaderProcess.js"));
const LightMapShader_js_1 = require("./shader/LightMapShader.js");
const LightMapShaderProcess_js_1 = __importDefault(require("./shader/LightMapShaderProcess.js"));
Math.degree = (radian) => radian * 180 / Math.PI;
Math.radian = (degree) => degree * Math.PI / 180;
Math.randomInt = () => Math.round(Math.random() * 10);
Array.prototype.get = function (index) { return this[this.loopIndex(index)]; };
Array.prototype.getPrev = function (index) { return this[this.loopIndex(index - 1)]; };
Array.prototype.getNext = function (index) { return this[this.loopIndex(index + 1)]; };
Array.prototype.loopIndex = function (index) {
    if (index < 0)
        return index % this.length + this.length;
    else
        return index % this.length;
};
class WebGL {
    constructor(canvas, globalOptions = {}) {
        this.frameBufferObjs = [];
        this.defaultFrameBufferObjs = [];
        this.lightMapFrameBufferObjs = [];
        this.renderableObjectList = new RenderableObjectList_js_1.default();
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
                this.gl = canvas.getContext("webgl2");
                version = "webgl2";
            }
            else if (canvas.getContext("webgl")) {
                this.gl = canvas.getContext("webgl");
                version = "webgl";
            } /* else if (canvas.getContext("experimental-webgl")) {
              this._gl = canvas.getContext("experimental-webgl");
              version = "experimental-webgl";
            } */
            if (!this.gl) {
                throw new Error("Unable to initialize WebGL. Your browser may not support it.");
            }
        }
        catch (e) {
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
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        const isChanged = (canvas.width !== displayWidth) || (canvas.height !== displayHeight);
        if (isChanged) {
            canvas.width = displayWidth;
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
        this.defaultShader = new Shader_js_1.default(gl);
        if (this.checkMultiRenders()) {
            this.defaultShader.init(DefaultShader_js_1.DefaultShader);
        }
        this.defaultShaderInfo = this.defaultShader.shaderInfo;
        this.screenShader = new Shader_js_1.default(gl);
        this.screenShader.init(ScreenShader_js_1.ScreenShader);
        this.screenShaderInfo = this.screenShader.shaderInfo;
        this.lightMapShader = new Shader_js_1.default(gl);
        this.lightMapShader.init(LightMapShader_js_1.LightMapShader);
        this.lightMapShaderInfo = this.lightMapShader.shaderInfo;
        this.camera = new Camera_js_1.default({ fovyDegree: this.globalOptions.fovyDegree });
        this.sun = new Sun_js_1.default({ position: { x: 0, y: 0, z: 8192 / 2 } });
        this.sun.rotationOrbit(0.5, 0.8, gl_matrix_1.vec3.fromValues(0, 0, 0));
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
        this.shaderProcesses.push(new DefaultShaderProcess_js_1.default(gl, this.defaultShader, this.camera, this.defaultFrameBufferObjs, this.renderableObjectList));
        this.shaderProcesses.push(new LightMapShaderProcess_js_1.default(gl, this.lightMapShader, this.camera, this.lightMapFrameBufferObjs, this.renderableObjectList, this.sun));
        this.shaderProcesses.push(new ScreenShaderProcess_js_1.default(gl, this.screenShader, this.camera, this.frameBufferObjs, this.sun));
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
        }
        else {
            this.gl.disable(this.gl.CULL_FACE);
        }
        if (this.globalOptions.depthTest) {
            this.gl.enable(this.gl.DEPTH_TEST);
        }
        else {
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
        const clearColor = gl_matrix_1.vec3.fromValues(0.2, 0.2, 0.2);
        if (!this.mainFbo) {
            this.mainFbo = new FrameBufferObject_js_1.default(this.gl, this.canvas, this.defaultShaderInfo, { name: "main", textureType, clearColor }, this.globalOptions);
        }
        return this.mainFbo;
    }
    getAlbedoFbo() {
        const textureType = 1;
        if (!this.albedoFbo) {
            this.albedoFbo = new FrameBufferObject_js_1.default(this.gl, this.canvas, this.defaultShaderInfo, { name: "albedo", textureType }, this.globalOptions);
        }
        return this.albedoFbo;
    }
    getSelectionFbo() {
        const textureType = 2;
        if (!this.selectionFbo) {
            this.selectionFbo = new FrameBufferObject_js_1.default(this.gl, this.canvas, this.defaultShaderInfo, { name: "selection", textureType }, this.globalOptions);
        }
        return this.selectionFbo;
    }
    getDepthFbo() {
        const textureType = 3;
        if (!this.depthFbo) {
            this.depthFbo = new FrameBufferObject_js_1.default(this.gl, this.canvas, this.defaultShaderInfo, { name: "depth", textureType }, this.globalOptions);
        }
        return this.depthFbo;
    }
    getNormalFbo() {
        const textureType = 4;
        if (!this.normalFbo) {
            this.normalFbo = new FrameBufferObject_js_1.default(this.gl, this.canvas, this.defaultShaderInfo, { name: "normal", textureType }, this.globalOptions);
        }
        return this.normalFbo;
    }
    getLightMapFbo() {
        const textureType = 5;
        if (!this.lightMapFbo) {
            this.lightMapFbo = new FrameBufferObject_js_1.default(this.gl, this.canvas, this.defaultShaderInfo, {
                name: "light",
                textureType: textureType,
                width: 8182,
                height: 8182,
            }, this.globalOptions);
        }
        return this.lightMapFbo;
    }
    get gl() {
        return this._gl;
    }
    set gl(setgl) {
        this._gl = setgl;
    }
    get canvas() {
        return this._canvas;
    }
    set canvas(setcanvas) {
        this._canvas = setcanvas;
    }
}
exports.default = WebGL;
