const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

import ShaderProcess from './abstract/ShaderProcess';
import Screen from './Screen.js';
import Buffer from './Buffer.js';

class ScreenShaderProcess extends ShaderProcess {
  screens;
  frameBufferObjs;
  constructor(gl, shader, camera, frameBufferObjs) {
    super(gl, shader);
    this.camera = camera;
    this.frameBufferObjs = frameBufferObjs;
    this.buffer = new Buffer(gl);
  }
  preprocess() {

    const shaderInfo = this.getShader().shaderInfo;
    this.screens = [];
    this.mainScreen = new Screen([[0, 0], [1, 0], [1, 1], [0, 1]], {reverse : true, forDebug : false, uniformLocation : shaderInfo.uniformLocations.mainTexture});
    this.albedoScreen = new Screen([[0.85, 0.85], [1, 0.85], [1, 1], [0.85, 1]], {reverse : true, forDebug : true, uniformLocation : shaderInfo.uniformLocations.albedoTexture});
    this.selectionScreen = new Screen([[0.85, 0.7], [1, 0.7], [1, 0.85], [0.85, 0.85]], {reverse : true, forDebug : true, uniformLocation : shaderInfo.uniformLocations.selectionTexture});
    this.normalScreen = new Screen([[0.85, 0.55], [1, 0.55], [1, 0.7], [0.85, 0.7]], {reverse : true, forDebug : true, uniformLocation : shaderInfo.uniformLocations.normalTexture});
    this.depthScreen = new Screen([[0.85, 0.40], [1, 0.40], [1, 0.55], [0.85, 0.55]], {reverse : true, forDebug : true, uniformLocation : shaderInfo.uniformLocations.depthTexture});
    this.screens.push(this.mainScreen);
    this.screens.push(this.albedoScreen);
    this.screens.push(this.selectionScreen);
    this.screens.push(this.normalScreen);
    this.screens.push(this.depthScreen);

    this.noiseTexture = this.buffer.createNoiseTexture();
  }
  process(globalOptions) {
    // /** @type {WebGLRenderingContext} */
    const gl = this.getGl();
    // /** @type {HTMLCanvasElement} */
    const canvas = this.getCanvas();
    const shaderInfo = this.getShader().shaderInfo;
    this.getShader().useProgram();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.lineWidth(globalOptions.lineWidth);

    let aspectRatio = (canvas.width / canvas.height);
    const fovy = Math.radian(this.camera.fovyDegree);
    let tangentOfHalfFovy = Math.tan(fovy / 2);

    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fovy, globalOptions.aspect, globalOptions.near, globalOptions.far);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

    gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
    gl.uniform1f(shaderInfo.uniformLocations.aspectRatio, aspectRatio);

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

    this.screens.forEach((ascreen, index) => {
      const textureProperty = gl["TEXTURE" + index];
      gl.activeTexture(textureProperty);
      gl.bindTexture(gl.TEXTURE_2D, ascreen.texture);
      gl.uniform1i(ascreen.uniformLocation, index);
    });
    gl.activeTexture(gl["TEXTURE" + this.screens.length]);
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
    gl.uniform1i(shaderInfo.uniformLocations.noiseTexture, this.screens.length);
  }
  postprocess(globalOptions) {
    const gl = this.getGl();
    const shaderInfo = this.getShader().shaderInfo;
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
      if (globalOptions.debugMode && screen.forDebug) {return;} 
      screen.render(gl, shaderInfo);
    });
    gl.enable(gl.DEPTH_TEST);
  }
}

export default ScreenShaderProcess;