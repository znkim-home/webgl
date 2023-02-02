import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

import ShaderProcess from '@/abstract/ShaderProcess';
import FrameBufferObject from '../functional/FrameBufferObject';
import Renderable from '../abstract/Renderable';

class DefaultShaderProcess extends ShaderProcess {
  renderableList: RenderableListInterface;
  frameBufferObjs: any;
  camera: any;
  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext, shader: any, globalOptions: GlobalOptions, camera: any, frameBufferObjs: any, renderableList: RenderableListInterface) {
    super(gl, shader, globalOptions);
    this.camera = camera;
    this.frameBufferObjs = frameBufferObjs;
    this.renderableList = renderableList;
  }
  preprocess() {}
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
    
    this.frameBufferObjs.forEach((frameBufferObj: FrameBufferObject) => {
      frameBufferObj.clear();
    });
    this.renderableList.get().forEach((renderableObj: Renderable) => {
      (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(this.renderableList) : undefined;
      renderableObj.render(gl, shaderInfo, this.frameBufferObjs);
    });
  }
  postprocess() {}
}

export default DefaultShaderProcess;