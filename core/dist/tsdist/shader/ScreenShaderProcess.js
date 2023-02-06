var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { mat4, vec2 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import ShaderProcess from '@/abstract/ShaderProcess';
import Screen from '@/renderable/Screen.js';
import Buffer from '@/Buffer.js';
var ScreenShaderProcess = /** @class */ (function (_super) {
    __extends(ScreenShaderProcess, _super);
    function ScreenShaderProcess(gl, shader, globalOptions, camera, frameBufferObjs, sun) {
        var _this = _super.call(this, gl, shader, globalOptions) || this;
        _this.camera = camera;
        _this.frameBufferObjs = frameBufferObjs;
        _this.buffer = new Buffer(gl);
        _this.sun = sun;
        return _this;
    }
    ScreenShaderProcess.prototype.preprocess = function () {
        var gl = this.gl;
        var shaderInfo = this.shaderInfo;
        this.screens = [];
        this.mainScreen = new Screen([[0, 0], [1, 0], [1, 1], [0, 1]], { reverse: true, forDebug: false, textureLocation: shaderInfo.uniformLocations.mainTexture });
        this.albedoScreen = new Screen([[0.85, 0.85], [1, 0.85], [1, 1], [0.85, 1]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.albedoTexture });
        this.selectionScreen = new Screen([[0.85, 0.7], [1, 0.7], [1, 0.85], [0.85, 0.85]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.selectionTexture });
        this.normalScreen = new Screen([[0.85, 0.55], [1, 0.55], [1, 0.7], [0.85, 0.7]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.normalTexture });
        this.depthScreen = new Screen([[0.85, 0.40], [1, 0.40], [1, 0.55], [0.85, 0.55]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.depthTexture });
        this.lightMapDepthScreen = new Screen([[0.92, 0.25], [1, 0.25], [1, 0.40], [0.92, 0.40]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.lightMapTexture });
        this.screens.push(this.mainScreen);
        this.screens.push(this.albedoScreen);
        this.screens.push(this.selectionScreen);
        this.screens.push(this.normalScreen);
        this.screens.push(this.depthScreen);
        this.screens.push(this.lightMapDepthScreen);
        this.noiseTexture = this.buffer.createNoiseTexture();
        this.mainScreen.glTextureNumber = gl.TEXTURE0;
        this.albedoScreen.glTextureNumber = gl.TEXTURE1;
        this.selectionScreen.glTextureNumber = gl.TEXTURE2;
        this.normalScreen.glTextureNumber = gl.TEXTURE3;
        this.depthScreen.glTextureNumber = gl.TEXTURE4;
        this.lightMapDepthScreen.glTextureNumber = gl.TEXTURE5;
        this.noiseTextureNumber = gl.TEXTURE6;
    };
    ScreenShaderProcess.prototype.process = function () {
        var gl = this.gl;
        var canvas = this.canvas;
        var shaderInfo = this.shaderInfo;
        var globalOptions = this.globalOptions;
        this.shader.useProgram();
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.lineWidth(globalOptions.lineWidth);
        var fovy = Math.radian(this.camera.fovyDegree);
        var tangentOfHalfFovy = Math.tan(fovy / 2);
        var orthographicMatrix = mat4.create();
        mat4.ortho(orthographicMatrix, -8192, 8192, -8192, 8192, 0, 8192);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.orthographicMatrix, false, orthographicMatrix);
        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fovy, globalOptions.aspect, globalOptions.near, globalOptions.far);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        var cameraTransformMatrix = this.camera.getTransformMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.cameraTransformMatrix, false, cameraTransformMatrix);
        var sunModelViewMatrix = this.sun.getModelViewMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.sunModelViewMatrix, false, sunModelViewMatrix);
        var sunNormalMatrix = this.sun.getNormalMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.sunNormalMatrix, false, sunNormalMatrix);
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
        gl.uniform1f(shaderInfo.uniformLocations.selectedObjectId, globalOptions.selectedObjectId);
        gl.uniform1f(shaderInfo.uniformLocations.aspectRatio, globalOptions.aspect);
        gl.uniform1i(shaderInfo.uniformLocations.enableSsao, globalOptions.enableSsao ? 1 : 0);
        gl.uniform1i(shaderInfo.uniformLocations.enableEdge, globalOptions.enableEdge ? 1 : 0);
        gl.uniform1i(shaderInfo.uniformLocations.enableGlobalLight, globalOptions.enableGlobalLight ? 1 : 0);
        gl.uniform1f(shaderInfo.uniformLocations.tangentOfHalfFovy, tangentOfHalfFovy);
        gl.uniform2fv(shaderInfo.uniformLocations.screenSize, vec2.fromValues(canvas.width, canvas.height));
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(globalOptions.near, globalOptions.far));
        gl.uniform2fv(shaderInfo.uniformLocations.noiseScale, vec2.fromValues(canvas.width / 4.0, canvas.height / 4.0));
        var ssaoKernelSample = [0.33, 0.0, 0.85,
            0.25, 0.3, 0.5,
            0.1, 0.3, 0.85,
            -0.15, 0.2, 0.85,
            -0.33, 0.05, 0.6,
            -0.1, -0.15, 0.85,
            -0.05, -0.32, 0.25,
            0.2, -0.15, 0.85,
            0.6, 0.0, 0.55,
            0.5, 0.6, 0.45,
            -0.01, 0.7, 0.35,
            -0.33, 0.5, 0.45,
            -0.45, 0.0, 0.55,
            -0.65, -0.5, 0.7,
            0.0, -0.5, 0.55,
            0.33, 0.3, 0.35];
        var ssaoKernel = new Float32Array(ssaoKernelSample);
        gl.uniform3fv(shaderInfo.uniformLocations.ssaoKernel, ssaoKernel);
        this.screens.forEach(function (screen, index) {
            gl.activeTexture(screen.glTextureNumber);
            gl.bindTexture(gl.TEXTURE_2D, screen.texture);
            gl.uniform1i(screen.textureLocation, index);
        });
        gl.activeTexture(this.noiseTextureNumber);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.uniform1i(shaderInfo.uniformLocations.noiseTexture, this.screens.length);
    };
    ScreenShaderProcess.prototype.postprocess = function () {
        var _this = this;
        var gl = this.gl;
        var shaderInfo = this.shaderInfo;
        var globalOptions = this.globalOptions;
        gl.disable(gl.DEPTH_TEST);
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
        this.screens.forEach(function (screen, index) {
            if (index == 0) {
                gl.uniform1i(shaderInfo.uniformLocations.isMain, 1);
            }
            else {
                gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
            }
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, screen.texture);
            screen.texture = _this.frameBufferObjs[index].texture;
            if (!globalOptions.debugMode && screen.forDebug) {
                return;
            }
            screen.render(gl, shaderInfo, []);
        });
        gl.enable(gl.DEPTH_TEST);
    };
    return ScreenShaderProcess;
}(ShaderProcess));
export default ScreenShaderProcess;
