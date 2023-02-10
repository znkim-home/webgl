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
        let lightMapBuffer = this.frameBufferObjs.get(0);
        let width = lightMapBuffer.widths[0];
        let height = lightMapBuffer.heights[0];
        let ortRange = this.sun.getRadius();
        gl.viewport(0, 0, width, height);
        let projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);
        let orthographicMatrix = mat4.create();
        mat4.ortho(orthographicMatrix, -ortRange, ortRange, -ortRange, ortRange, 0, ortRange * 2);
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(0, ortRange * 2));
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
