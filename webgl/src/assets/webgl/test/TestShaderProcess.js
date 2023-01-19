const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

import ShaderProcess from './abstract/ShaderProcess';

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
    const gl = this.getGl();
    console.log("==========");
    console.log("MAX_TEXTURE_SIZE", gl.getParameter(gl.MAX_TEXTURE_SIZE));
    console.log("MAX_VERTEX_ATTRIBS", gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
    console.log("MAX_VERTEX_UNIFORM_VECTORS", gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
    console.log("MAX_VARYING_VECTORS", gl.getParameter(gl.MAX_VARYING_VECTORS));
    console.log("MAX_COMBINED_TEXTURE_IMAGE_UNITS", gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
    console.log("MAX_VERTEX_TEXTURE_IMAGE_UNITS", gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
    console.log("MAX_TEXTURE_IMAGE_UNITS", gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
    console.log("MAX_FRAGMENT_UNIFORM_VECTORS", gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
    console.log("MAX_CUBE_MAP_TEXTURE_SIZE", gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
    console.log("MAX_RENDERBUFFER_SIZE", gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
    console.log("MAX_VIEWPORT_DIMS", gl.getParameter(gl.MAX_VIEWPORT_DIMS));
  }
  process(globalOptions) {
    /** @type {WebGLRenderingContext} */
    const gl = this.getGl();
    const canvas = gl.canvas;
    const shaderInfo = this.getShader().shaderInfo;
    this.getShader().useProgram();  

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projectionMatrix = mat4.create();
    let modelViewMatrix = this.camera.getModelViewMatrix();
    mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, parseFloat(globalOptions.near), parseFloat(globalOptions.far));
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    
    this.renderableList.forEach((renderableObj) => {
      renderableObj.render(gl, shaderInfo);
    });
  }
  postprocess() {
    
  }
}

export default DefaultShaderProcess;