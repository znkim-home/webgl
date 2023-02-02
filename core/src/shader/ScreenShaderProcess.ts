import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

import ShaderProcess from '@/abstract/ShaderProcess';
import Screen from '@/renderable/Screen.js';
import Buffer from '@/Buffer.js';
import Camera from '../Camera';
import FrameBufferObject from '../functional/FrameBufferObject';
import Sun from '../Sun';
import Shader from '../Shader';

class ScreenShaderProcess extends ShaderProcess {
  screens: Array<Screen>;
  camera: Camera;
  buffer: Buffer;
  sun: Sun;
  frameBufferObjs: Array<FrameBufferObject>;

  mainScreen: Screen;
  albedoScreen: Screen;
  selectionScreen: Screen;
  normalScreen: Screen;
  depthScreen: Screen;
  lightMapDepthScreen: Screen;

  noiseTexture: WebGLTexture;
  noiseTextureNumber: number;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, shader: Shader, globalOptions: GlobalOptions, camera: Camera, frameBufferObjs: Array<FrameBufferObject>, sun: Sun) {
    super(gl, shader, globalOptions);
    this.camera = camera;
    this.frameBufferObjs = frameBufferObjs;
    this.buffer = new Buffer(gl);
    this.sun = sun;
  }
  preprocess() {
    const gl = this.gl;
    const shaderInfo = this.shaderInfo;
    this.screens = [];
    this.mainScreen = new Screen([[0, 0], [1, 0], [1, 1], [0, 1]], {reverse : true, forDebug : false, textureLocation : shaderInfo.uniformLocations.mainTexture});
    this.albedoScreen = new Screen([[0.85, 0.85], [1, 0.85], [1, 1], [0.85, 1]], {reverse : true, forDebug : true, textureLocation : shaderInfo.uniformLocations.albedoTexture});
    this.selectionScreen = new Screen([[0.85, 0.7], [1, 0.7], [1, 0.85], [0.85, 0.85]], {reverse : true, forDebug : true, textureLocation : shaderInfo.uniformLocations.selectionTexture});
    this.normalScreen = new Screen([[0.85, 0.55], [1, 0.55], [1, 0.7], [0.85, 0.7]], {reverse : true, forDebug : true, textureLocation : shaderInfo.uniformLocations.normalTexture});
    this.depthScreen = new Screen([[0.85, 0.40], [1, 0.40], [1, 0.55], [0.85, 0.55]], {reverse : true, forDebug : true, textureLocation : shaderInfo.uniformLocations.depthTexture});
    this.lightMapDepthScreen = new Screen([[0.92, 0.25], [1, 0.25], [1, 0.40], [0.92, 0.40]], {reverse : true, forDebug : true, textureLocation : shaderInfo.uniformLocations.lightMapTexture});
    this.screens.push(this.mainScreen);
    this.screens.push(this.albedoScreen);
    this.screens.push(this.selectionScreen);
    this.screens.push(this.normalScreen);
    this.screens.push(this.depthScreen);
    this.screens.push(this.lightMapDepthScreen);
    this.noiseTexture = this.buffer.createNoiseTexture();

    this.mainScreen.glTextureNumber = gl.TEXTURE0;
    this.albedoScreen.glTextureNumber = gl.TEXTURE1;
    this.selectionScreen.glTextureNumber = gl.TEXTURE2;
    this.normalScreen.glTextureNumber = gl.TEXTURE3;
    this.depthScreen.glTextureNumber = gl.TEXTURE4;
    this.lightMapDepthScreen.glTextureNumber = gl.TEXTURE5;
    this.noiseTextureNumber = gl.TEXTURE6;
  }
  process() {
    const gl = this.gl;
    const canvas = this.canvas;
    const shaderInfo = this.shaderInfo;
    const globalOptions = this.globalOptions;

    this.shader.useProgram();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.lineWidth(globalOptions.lineWidth);

    const fovy = Math.radian(this.camera.fovyDegree);
    let tangentOfHalfFovy = Math.tan(fovy / 2);

    let orthographicMatrix = mat4.create();
    mat4.ortho(orthographicMatrix, -8192, 8192, -8192, 8192, 0, 8192);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.orthographicMatrix, false, orthographicMatrix);

    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fovy, globalOptions.aspect, globalOptions.near, globalOptions.far);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    let cameraTransformMatrix = this.camera.getTransformMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.cameraTransformMatrix, false, cameraTransformMatrix);

    let sunModelViewMatrix = this.sun.getModelViewMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.sunModelViewMatrix, false, sunModelViewMatrix);
    let sunNormalMatrix = this.sun.getNormalMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.sunNormalMatrix, false, sunNormalMatrix);

    gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
    gl.uniform1f(shaderInfo.uniformLocations.selectedObjectId, globalOptions.selectedObjectId);
    gl.uniform1f(shaderInfo.uniformLocations.aspectRatio, globalOptions.aspect);

    gl.uniform1i(shaderInfo.uniformLocations.enableSsao, globalOptions.enableSsao ? 1 : 0);
    gl.uniform1i(shaderInfo.uniformLocations.enableEdge, globalOptions.enableEdge ? 1 : 0);
    gl.uniform1i(shaderInfo.uniformLocations.enableGlobalLight, globalOptions.enableGlobalLight ? 1 : 0);

    gl.uniform1f(shaderInfo.uniformLocations.tangentOfHalfFovy, tangentOfHalfFovy);
    gl.uniform2fv(shaderInfo.uniformLocations.screenSize, vec2.fromValues(canvas.width, canvas.height));
    gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(globalOptions.near, globalOptions.far));
    gl.uniform2fv(shaderInfo.uniformLocations.noiseScale, vec2.fromValues(canvas.width / 4.0, canvas.height / 4.0));

    const ssaoKernelSample = [ 0.33, 0.0, 0.85,
      0.25, 0.3, 0.5,
      0.1, 0.3, 0.85,
      -0.15, 0.2, 0.85,
      -0.33, 0.05, 0.6,
      -0.1, -0.15, 0.85,
      -0.05, -0.32, 0.25,
      0.2, -0.15, 0.85,
      0.6, 0.0, 0.55,
      0.5, 0.6, 0.45,
      -0.01, 0.7, 0.35,
      -0.33, 0.5, 0.45,
      -0.45, 0.0, 0.55,
      -0.65, -0.5, 0.7,
      0.0, -0.5, 0.55,
      0.33, 0.3, 0.35];
    const ssaoKernel = new Float32Array(ssaoKernelSample);
    gl.uniform3fv(shaderInfo.uniformLocations.ssaoKernel, ssaoKernel);

    this.screens.forEach((screen: Screen, index: number) => {
      gl.activeTexture(screen.glTextureNumber);
      gl.bindTexture(gl.TEXTURE_2D, screen.texture);
      gl.uniform1i(screen.textureLocation, index);
    });
    gl.activeTexture(this.noiseTextureNumber);
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
    gl.uniform1i(shaderInfo.uniformLocations.noiseTexture, this.screens.length);
  }
  postprocess() {
    const gl = this.gl;
    const shaderInfo = this.shaderInfo;
    const globalOptions = this.globalOptions;

    gl.disable(gl.DEPTH_TEST);
    gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
    this.screens.forEach((screen, index) => {
      if (index == 0) {
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 1);
      } else {
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, screen.texture);
      screen.texture = this.frameBufferObjs[index].texture;
      if (!globalOptions.debugMode && screen.forDebug) {return;} 
      screen.render(gl, shaderInfo, []);
    });
    gl.enable(gl.DEPTH_TEST);
  }
}

export default ScreenShaderProcess;