import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

import ShaderProcess from '../abstract/ShaderProcess';
import Shader from '../Shader';
import FrameBufferObject from '../functional/FrameBufferObject';
import Sun from '../Sun';
import Camera from '../Camera';
import Renderable from '../abstract/Renderable';

class LightMapShaderProcess extends ShaderProcess {
  screens: Array<Screen>;
  camera: Camera;
  sun: Sun;
  buffer: Buffer;
  frameBufferObjs: Array<FrameBufferObject>;
  renderableList: RenderableListInterface;
  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, shader: Shader, globalOptions: GlobalOptions, camera: Camera, frameBufferObjs: Array<FrameBufferObject>, renderableList: RenderableListInterface, sun: Sun) {
    super(gl, shader, globalOptions);
    this.camera = camera;
    this.sun = sun;
    this.frameBufferObjs = frameBufferObjs;
    this.renderableList = renderableList;
  }
  preprocess() {}
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
    gl.lineWidth(globalOptions.lineWidth);

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
    this.renderableList.get().forEach((renderableObj: Renderable) => {
      (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(this.renderableList) : undefined;
      renderableObj.render(gl, shaderInfo, this.frameBufferObjs);
    });
  }
  postprocess() {}
}

export default LightMapShaderProcess;