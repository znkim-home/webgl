const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

import ShaderProcess from './abstract/ShaderProcess';
import Screen from './Screen.js';

class ScreenShaderProcess extends ShaderProcess {
  screens;
  frameBufferObjs;
  constructor(gl, shader, camera, frameBufferObjs) {
    super(gl, shader);
    this.camera = camera;
    this.frameBufferObjs = frameBufferObjs;
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

    gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
    gl.uniform1f(shaderInfo.uniformLocations.screenWidth, canvas.width);
    gl.uniform1f(shaderInfo.uniformLocations.screenHeight, canvas.height);

    this.screens.forEach((ascreen, index) => {
      const textureProperty = gl["TEXTURE" + index];
      gl.activeTexture(textureProperty);
      gl.bindTexture(gl.TEXTURE_2D, ascreen.texture);
      gl.uniform1i(ascreen.uniformLocation, index);
      //console.log(screen.texture);
    });
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