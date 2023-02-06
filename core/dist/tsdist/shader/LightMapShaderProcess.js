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
var LightMapShaderProcess = /** @class */ (function (_super) {
    __extends(LightMapShaderProcess, _super);
    function LightMapShaderProcess(gl, shader, globalOptions, camera, frameBufferObjs, renderableList, sun) {
        var _this = _super.call(this, gl, shader, globalOptions) || this;
        _this.camera = camera;
        _this.sun = sun;
        _this.frameBufferObjs = frameBufferObjs;
        _this.renderableList = renderableList;
        return _this;
    }
    LightMapShaderProcess.prototype.preprocess = function () { };
    LightMapShaderProcess.prototype.process = function () {
        var _this = this;
        var gl = this.gl;
        var shaderInfo = this.shaderInfo;
        var globalOptions = this.globalOptions;
        this.shader.useProgram();
        gl.viewport(0, 0, 8182, 8182);
        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);
        var orthographicMatrix = mat4.create();
        mat4.ortho(orthographicMatrix, -8192, 8192, -8192, 8192, 0, 8192);
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(0, 8192));
        var modelViewMatrix = this.sun.getModelViewMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.orthographicMatrix, false, orthographicMatrix);
        this.frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.clear();
        });
        this.renderableList.get().forEach(function (renderableObj) {
            (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(_this.renderableList) : undefined;
            renderableObj.render(gl, shaderInfo, _this.frameBufferObjs);
        });
    };
    LightMapShaderProcess.prototype.postprocess = function () { };
    return LightMapShaderProcess;
}(ShaderProcess));
export default LightMapShaderProcess;
