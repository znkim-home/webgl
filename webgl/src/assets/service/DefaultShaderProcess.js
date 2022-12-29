const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

import ShaderProcess from './abstract/ShaderProcess';
//import Rectangle from './Rectangle.js';

class DefaultShaderProcess extends ShaderProcess {
  renderableList;
  frameBufferObjs;
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
    //const canvas = this.getCanvas();
    const shaderInfo = this.getShader().shaderInfo;
    this.getShader().useProgram();

    //gl.viewport(0, 0, canvas.width, canvas.height);
    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW);
    //gl.lineWidth(globalOptions.lineWidth);

    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);
    let modelViewMatrix = this.camera.getModelViewMatrix();
    let normalMatrix = this.camera.getNormalMatrix();

    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniform1f(shaderInfo.uniformLocations.pointSize, globalOptions.pointSize);
    gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
    gl.uniform1i(shaderInfo.uniformLocations.positionType, 0);
    
    this.frameBufferObjs.forEach((frameBufferObj) => {
      frameBufferObj.clear();
    });
    this.renderableList.get().forEach((renderableObj) => {
      (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(this.renderableList) : undefined;
      renderableObj.render(gl, shaderInfo, this.frameBufferObjs);
    });
  }
  postprocess() {
    // const gl = this.getGl();
    // const shaderInfo = this.getShader().shaderInfo;
    // gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
    // gl.uniform1i(shaderInfo.uniformLocations.positionType, 1);
    // gl.disable(gl.DEPTH_TEST);
    // this.albedoRectangle.texture = this.frameBufferObjs[0].texture;
    // this.albedoRectangle.render(gl, shaderInfo, undefined);
    // this.selectionRectangle.texture = this.frameBufferObjs[1].texture;
    // this.selectionRectangle.render(gl, shaderInfo, undefined);
    // this.depthRectangle.texture = this.frameBufferObjs[2].texture;
    // this.depthRectangle.render(gl, shaderInfo, undefined);
    // this.normalRectangle.texture = this.frameBufferObjs[3].texture;
    // this.normalRectangle.render(gl, shaderInfo, undefined);
    // gl.enable(gl.DEPTH_TEST);
  }
}

export default DefaultShaderProcess;