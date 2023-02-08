import { mat4, vec2 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import ShaderProcess from '../abstract/ShaderProcess';
class DefaultShaderProcess extends ShaderProcess {
    constructor(gl, shader, globalOptions, camera, frameBufferObjs, renderableList) {
        super(gl, shader, globalOptions);
        this.camera = camera;
        this.frameBufferObjs = frameBufferObjs;
        this.renderableList = renderableList;
    }
    preprocess() { }
    process() {
        const gl = this.gl;
        const shaderInfo = this.shaderInfo;
        const globalOptions = this.globalOptions;
        this.shader.useProgram();
        let projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);
        let modelViewMatrix = this.camera.getModelViewMatrix();
        let normalMatrix = this.camera.getNormalMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(globalOptions.near, globalOptions.far));
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
    postprocess() { }
}
export default DefaultShaderProcess;
