import { vec3 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
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
Math.degree = function (radian) { return radian * 180 / Math.PI; };
Math.radian = function (degree) { return degree * Math.PI / 180; };
Math.randomInt = function () { return Math.round(Math.random() * 10); };
Array.prototype.get = function (index) { return this[this.loopIndex(index)]; };
Array.prototype.getPrev = function (index) { return this[this.loopIndex(index - 1)]; };
Array.prototype.getNext = function (index) { return this[this.loopIndex(index + 1)]; };
Array.prototype.loopIndex = function (index) {
    if (index < 0)
        return index % this.length + this.length;
    else
        return index % this.length;
};
var WebGL = /** @class */ (function () {
    function WebGL(canvas, globalOptions) {
        if (globalOptions === void 0) { globalOptions = {}; }
        this.frameBufferObjs = [];
        this.defaultFrameBufferObjs = [];
        this.lightMapFrameBufferObjs = [];
        this.renderableObjectList = new RenderableObjectList();
        this.shaderProcesses = [];
        this.globalOptions = globalOptions;
        this._canvas = canvas;
        this.init();
    }
    WebGL.prototype.init = function () {
        console.log("Init Start WebGL.");
        var version = "";
        try {
            var canvas = this._canvas;
            if (canvas.getContext("webgl2")) {
                this.gl = canvas.getContext("webgl2");
                version = "webgl2";
            }
            else if (canvas.getContext("webgl")) {
                this.gl = canvas.getContext("webgl");
                version = "webgl";
            }
            if (!this.gl) {
                throw new Error("Unable to initialize WebGL. Your browser may not support it.");
            }
        }
        catch (e) {
            console.log("Unable to initialize WebGL. Your browser may not support it.");
            console.error(e);
        }
        console.log("Init Success " + version);
    };
    WebGL.prototype.checkMultiRenders = function () {
        var ext = this._gl.getExtension('WEBGL_draw_buffers');
        return !ext;
    };
    WebGL.prototype.resizeCanvas = function () {
        var canvas = this.canvas;
        var displayWidth = canvas.clientWidth;
        var displayHeight = canvas.clientHeight;
        var isChanged = (canvas.width !== displayWidth) || (canvas.height !== displayHeight);
        if (isChanged) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            this.frameBufferObjs.forEach(function (frameBufferObj) {
                if (!frameBufferObj.options.isNotInit) {
                    frameBufferObj.init();
                }
            });
            console.log("resizeCanvas");
        }
        this.globalOptions.aspect = (canvas.width / canvas.height);
        return isChanged;
    };
    WebGL.prototype.startRender = function () {
        var gl = this.gl;
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
        this.camera = new Camera({ fovyDegree: this.globalOptions.fovyDegree });
        this.sun = new Sun({ position: { x: 0, y: 0, z: 8192 / 2 } });
        this.sun.rotationOrbit(0.5, 0.8, vec3.fromValues(0, 0, 0));
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
        this.shaderProcesses.forEach(function (shaderProcess) {
            shaderProcess.preprocess();
        });
        this.render();
    };
    WebGL.prototype.setOptions = function () {
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
    };
    WebGL.prototype.render = function () {
        this.scene();
        requestAnimationFrame(this.render.bind(this));
    };
    WebGL.prototype.scene = function () {
        var _this = this;
        this.setOptions();
        this.shaderProcesses.forEach(function (shaderProcess) {
            shaderProcess.process(_this.globalOptions);
        });
        this.shaderProcesses.forEach(function (shaderProcess) {
            shaderProcess.postprocess(_this.globalOptions);
        });
    };
    WebGL.prototype.getMainFbo = function () {
        var textureType = 1;
        var clearColor = vec3.fromValues(0.2, 0.2, 0.2);
        if (!this.mainFbo) {
            this.mainFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "main", textureType: textureType, clearColor: clearColor }, this.globalOptions);
        }
        return this.mainFbo;
    };
    WebGL.prototype.getAlbedoFbo = function () {
        var textureType = 1;
        if (!this.albedoFbo) {
            this.albedoFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "albedo", textureType: textureType }, this.globalOptions);
        }
        return this.albedoFbo;
    };
    WebGL.prototype.getSelectionFbo = function () {
        var textureType = 2;
        if (!this.selectionFbo) {
            this.selectionFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "selection", textureType: textureType }, this.globalOptions);
        }
        return this.selectionFbo;
    };
    WebGL.prototype.getDepthFbo = function () {
        var textureType = 3;
        if (!this.depthFbo) {
            this.depthFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "depth", textureType: textureType }, this.globalOptions);
        }
        return this.depthFbo;
    };
    WebGL.prototype.getNormalFbo = function () {
        var textureType = 4;
        if (!this.normalFbo) {
            this.normalFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "normal", textureType: textureType }, this.globalOptions);
        }
        return this.normalFbo;
    };
    WebGL.prototype.getLightMapFbo = function () {
        var textureType = 5;
        if (!this.lightMapFbo) {
            this.lightMapFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, {
                name: "light",
                textureType: textureType,
                width: 8182,
                height: 8182,
            }, this.globalOptions);
        }
        return this.lightMapFbo;
    };
    Object.defineProperty(WebGL.prototype, "gl", {
        get: function () {
            return this._gl;
        },
        set: function (setgl) {
            this._gl = setgl;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGL.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        set: function (setcanvas) {
            this._canvas = setcanvas;
        },
        enumerable: false,
        configurable: true
    });
    return WebGL;
}());
export default WebGL;
