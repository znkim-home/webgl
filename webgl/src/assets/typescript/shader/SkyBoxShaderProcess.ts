import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

import ShaderProcess from '../abstract/ShaderProcess';
import FrameBufferObject from '../functional/FrameBufferObject';
import Renderable from '../abstract/Renderable';
import RenderableObjectList from '@/functional/RenderableObjectList';
import { Camera, Shader } from '..';

class SkyBoxShaderProcess extends ShaderProcess {
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
    let modelViewMatrix = this.camera.getModelViewMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
    
    this.frameBufferObjs.forEach((frameBufferObj: FrameBufferObject) => {
      frameBufferObj.clear();
    });
    this.renderableList.get().forEach((renderableObj: Renderable) => {
      (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(this.renderableList) : undefined;
      let cameraPosition = this.camera.position;
      let zOffset = 1000000000 / 2;
      renderableObj.position = vec3.fromValues(cameraPosition[0], cameraPosition[1], cameraPosition[2] - zOffset);
      renderableObj.dirty = true;
      renderableObj.render(gl, shaderInfo, this.frameBufferObjs);
    });
  }
  postprocess() {}
}

export default SkyBoxShaderProcess;