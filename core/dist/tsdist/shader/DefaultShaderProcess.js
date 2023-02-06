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
var DefaultShaderProcess = /** @class */ (function (_super) {
    __extends(DefaultShaderProcess, _super);
    function DefaultShaderProcess(gl, shader, globalOptions, camera, frameBufferObjs, renderableList) {
        var _this = _super.call(this, gl, shader, globalOptions) || this;
        _this.camera = camera;
        _this.frameBufferObjs = frameBufferObjs;
        _this.renderableList = renderableList;
        return _this;
    }
    DefaultShaderProcess.prototype.preprocess = function () { };
    DefaultShaderProcess.prototype.process = function () {
        var _this = this;
        var gl = this.gl;
        var shaderInfo = this.shaderInfo;
        var globalOptions = this.globalOptions;
        this.shader.useProgram();
        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);
        var modelViewMatrix = this.camera.getModelViewMatrix();
        var normalMatrix = this.camera.getNormalMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(globalOptions.near, globalOptions.far));
        gl.uniform1f(shaderInfo.uniformLocations.pointSize, globalOptions.pointSize);
        gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
        this.frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.clear();
        });
        this.renderableList.get().forEach(function (renderableObj) {
            (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(_this.renderableList) : undefined;
            renderableObj.render(gl, shaderInfo, _this.frameBufferObjs);
        });
    };
    DefaultShaderProcess.prototype.postprocess = function () { };
    return DefaultShaderProcess;
}(ShaderProcess));
export default DefaultShaderProcess;
