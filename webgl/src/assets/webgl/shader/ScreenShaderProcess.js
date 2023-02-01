"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix"); // eslint-disable-line no-unused-vars
const ShaderProcess_1 = __importDefault(require("@/assets/webgl/abstract/ShaderProcess"));
const Screen_js_1 = __importDefault(require("@/assets/webgl/renderable/Screen.js"));
const Buffer_js_1 = __importDefault(require("@/assets/webgl/Buffer.js"));
class ScreenShaderProcess extends ShaderProcess_1.default {
    constructor(gl, shader, camera, frameBufferObjs, sun) {
        super(gl, shader);
        this.camera = camera;
        this.frameBufferObjs = frameBufferObjs;
        this.buffer = new Buffer_js_1.default(gl);
        this.sun = sun;
    }
    preprocess() {
        const shaderInfo = this.shaderInfo;
        this.screens = [];
        this.mainScreen = new Screen_js_1.default([[0, 0], [1, 0], [1, 1], [0, 1]], { reverse: true, forDebug: false, uniformLocation: shaderInfo.uniformLocations.mainTexture });
        this.albedoScreen = new Screen_js_1.default([[0.85, 0.85], [1, 0.85], [1, 1], [0.85, 1]], { reverse: true, forDebug: true, uniformLocation: shaderInfo.uniformLocations.albedoTexture });
        this.selectionScreen = new Screen_js_1.default([[0.85, 0.7], [1, 0.7], [1, 0.85], [0.85, 0.85]], { reverse: true, forDebug: true, uniformLocation: shaderInfo.uniformLocations.selectionTexture });
        this.normalScreen = new Screen_js_1.default([[0.85, 0.55], [1, 0.55], [1, 0.7], [0.85, 0.7]], { reverse: true, forDebug: true, uniformLocation: shaderInfo.uniformLocations.normalTexture });
        this.depthScreen = new Screen_js_1.default([[0.85, 0.40], [1, 0.40], [1, 0.55], [0.85, 0.55]], { reverse: true, forDebug: true, uniformLocation: shaderInfo.uniformLocations.depthTexture });
        this.lightMapDepthScreen = new Screen_js_1.default([[0.92, 0.25], [1, 0.25], [1, 0.40], [0.92, 0.40]], { reverse: true, forDebug: true, uniformLocation: shaderInfo.uniformLocations.lightMapTexture });
        this.screens.push(this.mainScreen);
        this.screens.push(this.albedoScreen);
        this.screens.push(this.selectionScreen);
        this.screens.push(this.normalScreen);
        this.screens.push(this.depthScreen);
        this.screens.push(this.lightMapDepthScreen);
        this.noiseTexture = this.buffer.createNoiseTexture();
    }
    process(globalOptions) {
        // /** @type {WebGLRenderingContext} */
        const gl = this.gl;
        // /** @type {HTMLCanvasElement} */
        const canvas = this.canvas;
        const shaderInfo = this.shaderInfo;
        this.shader.useProgram();
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.lineWidth(globalOptions.lineWidth);
        const fovy = Math.radian(this.camera.fovyDegree);
        let tangentOfHalfFovy = Math.tan(fovy / 2);
        let orthographicMatrix = gl_matrix_1.mat4.create();
        gl_matrix_1.mat4.ortho(orthographicMatrix, -8192, 8192, -8192, 8192, 0, 8192);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.orthographicMatrix, false, orthographicMatrix);
        let projectionMatrix = gl_matrix_1.mat4.create();
        gl_matrix_1.mat4.perspective(projectionMatrix, fovy, globalOptions.aspect, parseFloat(globalOptions.near), parseFloat(globalOptions.far));
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        let cameraTransformMatrix = this.camera.getTransformMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.cameraTransformMatrix, false, cameraTransformMatrix);
        let sunModelViewMatrix = this.sun.getModelViewMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.sunModelViewMatrix, false, sunModelViewMatrix);
        let sunNormalMatrix = this.sun.getNormalMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.sunNormalMatrix, false, sunNormalMatrix);
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
        gl.uniform1f(shaderInfo.uniformLocations.selectedObjectId, globalOptions.selectedObjectId);
        gl.uniform1f(shaderInfo.uniformLocations.aspectRatio, globalOptions.aspect);
        gl.uniform1i(shaderInfo.uniformLocations.enableSsao, globalOptions.enableSsao ? 1 : 0);
        gl.uniform1i(shaderInfo.uniformLocations.enableEdge, globalOptions.enableEdge ? 1 : 0);
        gl.uniform1i(shaderInfo.uniformLocations.enableGlobalLight, globalOptions.enableGlobalLight ? 1 : 0);
        gl.uniform1f(shaderInfo.uniformLocations.tangentOfHalfFovy, tangentOfHalfFovy);
        gl.uniform2fv(shaderInfo.uniformLocations.screenSize, gl_matrix_1.vec2.fromValues(canvas.width, canvas.height));
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, gl_matrix_1.vec2.fromValues(parseFloat(globalOptions.near), parseFloat(globalOptions.far)));
        gl.uniform2fv(shaderInfo.uniformLocations.noiseScale, gl_matrix_1.vec2.fromValues(canvas.width / 4.0, canvas.height / 4.0));
        const ssaoKernelSample = [0.33, 0.0, 0.85,
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
        const ssaoKernel = new Float32Array(ssaoKernelSample);
        gl.uniform3fv(shaderInfo.uniformLocations.ssaoKernel, ssaoKernel);
        this.screens.forEach((ascreen, index) => {
            const textureProperty = gl["TEXTURE" + index];
            gl.activeTexture(textureProperty);
            gl.bindTexture(gl.TEXTURE_2D, ascreen.texture);
            gl.uniform1i(ascreen.uniformLocation, index);
        });
        gl.activeTexture(gl["TEXTURE" + this.screens.length]);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.uniform1i(shaderInfo.uniformLocations.noiseTexture, this.screens.length);
    }
    postprocess(globalOptions) {
        const gl = this.gl;
        const shaderInfo = this.shaderInfo;
        gl.disable(gl.DEPTH_TEST);
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
        this.screens.forEach((screen, index) => {
            if (index == 0) {
                gl.uniform1i(shaderInfo.uniformLocations.isMain, 1);
            }
            else {
                gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
            }
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, screen.texture);
            screen.texture = this.frameBufferObjs[index].texture;
            if (!globalOptions.debugMode && screen.forDebug) {
                return;
            }
            screen.render(gl, shaderInfo);
        });
        gl.enable(gl.DEPTH_TEST);
    }
}
exports.default = ScreenShaderProcess;
