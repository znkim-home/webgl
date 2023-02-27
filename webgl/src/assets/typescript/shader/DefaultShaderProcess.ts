import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

import ShaderProcess from '../abstract/ShaderProcess';
import FrameBufferObject from '../functional/FrameBufferObject';
import Renderable from '../abstract/Renderable';
import RenderableObjectList from '@/functional/RenderableObjectList';
import { Camera, Shader } from '..';

class DefaultShaderProcess extends ShaderProcess {
  renderableList: RenderableObjectList;
  frameBufferObjs: Array<FrameBufferObject>;
  camera: Camera;
  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext, shader: Shader, globalOptions: GlobalOptions, camera: Camera, frameBufferObjs: Array<FrameBufferObject>, renderableList: RenderableObjectList) {
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
    let modelRotationMatrix = this.camera.getModelViewRotationMatrixRelToEye();
    let normalMatrix = this.camera.getNormalMatrix();
    let positionHighLow: vec3[] = this.camera.getPositionHighLow();

    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelRotationMatrix, false, modelRotationMatrix);
    gl.uniform3fv(shaderInfo.uniformLocations.modelPositionHigh, positionHighLow[0]);
    gl.uniform3fv(shaderInfo.uniformLocations.modelPositionLow, positionHighLow[1]);

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
      renderableObj.postRender(gl, shaderInfo, this.frameBufferObjs);
    });
  }
  postprocess() {}
}

export default DefaultShaderProcess;