import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import ShaderProcess from '@/assets/webgl/abstract/ShaderProcess';
class DefaultShaderProcess extends ShaderProcess {
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
        const gl = this.getGl();
        /** @type {HTMLCanvasElement} */
        const shaderInfo = this.getShader().shaderInfo;
        this.getShader().useProgram();
        let projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, parseFloat(globalOptions.near), parseFloat(globalOptions.far));
        let modelViewMatrix = this.camera.getModelViewMatrix();
        let normalMatrix = this.camera.getNormalMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(parseFloat(globalOptions.near), parseFloat(globalOptions.far)));
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
export default DefaultShaderProcess;
