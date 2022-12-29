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
    this.albedoScreen = new Screen([[0.8, 0.8], [1, 0.8], [1, 1], [0.8, 1]], {reverse : true, forDebug : true, uniformLocation : shaderInfo.uniformLocations.albedoTexture});
    this.selectionScreen = new Screen([[0.8, 0.6], [1, 0.6], [1, 0.8], [0.8, 0.8]], {reverse : true, forDebug : true, uniformLocation : shaderInfo.uniformLocations.selectionTexture});
    this.normalScreen = new Screen([[0.8, 0.4], [1, 0.4], [1, 0.6], [0.8, 0.6]], {reverse : true, forDebug : true, uniformLocation : shaderInfo.uniformLocations.normalTexture});
    this.depthScreen = new Screen([[0.8, 0.2], [1, 0.2], [1, 0.4], [0.8, 0.4]], {reverse : true, forDebug : false, uniformLocation : shaderInfo.uniformLocations.depthTexture});
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
  postprocess() {
    const gl = this.getGl();
    const shaderInfo = this.getShader().shaderInfo;
    gl.disable(gl.DEPTH_TEST);
    this.screens.forEach((ascreen, index) => {
      //if (screen.forDebug == true) {return;} 
      if (index == 0) {
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 1);
      } else {
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, ascreen.texture);
      ascreen.texture = this.frameBufferObjs[index].texture;
      ascreen.render(gl, shaderInfo);
    });
    gl.enable(gl.DEPTH_TEST);
  }
}

export default ScreenShaderProcess;