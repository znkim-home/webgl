const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

import ShaderProcess from './abstract/ShaderProcess';

class LightMapShaderProcess extends ShaderProcess {
  renderableList;
  frameBufferObjs;
  constructor(gl, shader, camera, frameBufferObjs, renderableList, sun) {
    super(gl, shader);
    this.camera = camera;
    this.sun = sun;
    this.frameBufferObjs = frameBufferObjs;
    this.renderableList = renderableList;
  }
  preprocess() {
    
  }
  process(globalOptions) {
    /** @type {WebGLRenderingContext} */
    const gl = this.getGl();
    /** @type {HTMLCanvasElement} */
    //const canvas = this.getCanvas();
    const shaderInfo = this.getShader().shaderInfo;
    this.getShader().useProgram();

    gl.viewport(0, 0, 8182 * 2, 8182 * 2);
    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW);
    //gl.lineWidth(globalOptions.lineWidth);

    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);

    let orthographicMatrix = mat4.create();
    mat4.ortho(orthographicMatrix, -2048, 2048, -2048, 2048, 0, 2048);

    gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(0, 2048));

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
  postprocess() {
    //
  }
}

export default LightMapShaderProcess;