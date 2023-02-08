import { mat4, vec2 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import ShaderProcess from '../abstract/ShaderProcess';
class LightMapShaderProcess extends ShaderProcess {
    constructor(gl, shader, globalOptions, camera, frameBufferObjs, renderableList, sun) {
        super(gl, shader, globalOptions);
        this.camera = camera;
        this.sun = sun;
        this.frameBufferObjs = frameBufferObjs;
        this.renderableList = renderableList;
    }
    preprocess() { }
    process() {
        const gl = this.gl;
        const shaderInfo = this.shaderInfo;
        const globalOptions = this.globalOptions;
        this.shader.useProgram();
        gl.viewport(0, 0, 8182, 8182);
        let projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);
        let orthographicMatrix = mat4.create();
        mat4.ortho(orthographicMatrix, -8192, 8192, -8192, 8192, 0, 8192);
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(0, 8192));
        let modelViewMatrix = this.sun.getModelViewMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.orthographicMatrix, false, orthographicMatrix);
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
export default LightMapShaderProcess;
