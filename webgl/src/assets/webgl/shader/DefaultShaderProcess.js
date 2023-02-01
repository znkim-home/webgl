"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix"); // eslint-disable-line no-unused-vars
const ShaderProcess_1 = __importDefault(require("@/assets/webgl/abstract/ShaderProcess"));
class DefaultShaderProcess extends ShaderProcess_1.default {
    constructor(gl, shader, camera, frameBufferObjs, renderableList) {
        super(gl, shader);
        this.camera = camera;
        this.frameBufferObjs = frameBufferObjs;
        this.renderableList = renderableList;
    }
    preprocess() {
    }
    process(globalOptions) {
        /** @type {WebGLRenderingContext} */
        const gl = this.gl;
        /** @type {HTMLCanvasElement} */
        const shaderInfo = this.shaderInfo;
        this.shader.useProgram();
        let projectionMatrix = gl_matrix_1.mat4.create();
        gl_matrix_1.mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, parseFloat(globalOptions.near), parseFloat(globalOptions.far));
        let modelViewMatrix = this.camera.getModelViewMatrix();
        let normalMatrix = this.camera.getNormalMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, gl_matrix_1.vec2.fromValues(parseFloat(globalOptions.near), parseFloat(globalOptions.far)));
        gl.uniform1f(shaderInfo.uniformLocations.pointSize, globalOptions.pointSize);
        gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
        this.frameBufferObjs.forEach((frameBufferObj) => {
            frameBufferObj.clear();
        });
        this.renderableList.get().forEach((renderableObj) => {
            (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(this.renderableList) : undefined;
            renderableObj.render(gl, shaderInfo, this.frameBufferObjs);
        });
    }
    postprocess() {
        //
    }
}
exports.default = DefaultShaderProcess;
