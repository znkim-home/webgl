import {vertexShaderSource, fragmentShaderSource} from './EzData.js';

export class EzShader {
  constructor(ezWebGL) {
    this.ezWebGL = ezWebGL;
    this.shaderProgram = null;
    this.shader = null;
    this.attribLocations = null;
    this.uniformLocations = null;
    this.initShader();
  }

  initShader() {
    let gl = this.ezWebGL.getGl();
    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, this.createVertexShader(vertexShaderSource));
    gl.attachShader(this.shaderProgram, this.createFragmentShader(fragmentShaderSource));
    gl.linkProgram(this.shaderProgram);
    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program.");
      console.error("Unable to initialize the shader program.");
    }
    this.attribLocations = {
      vertexPosition: gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(this.shaderProgram, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
      //vertexColor: gl.getAttribLocation(this.shaderProgram, "aVertexColor")
    };
    this.uniformLocations = {
      projectionMatrix: gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(this.shaderProgram, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(this.shaderProgram, 'uSampler'),
    };
    gl.useProgram(this.shaderProgram);
  }

  getAttribLocations() {
    return this.attribLocations;
  }
  getUniformLocations() {
    return this.uniformLocations;
  }
  getShaderProgram() {
    return this.shaderProgram;
  }
  getFragmentShader() {
    return this.fragmentShader;
  }
  getVertexShader() {
    return this.vertexShader;
  }

  createFragmentShader(shaderSource) {
    let gl = this.ezWebGL.getGl();
    let shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        let errorText = `An error occurred compiling the fragment shaders:  ${gl.getShaderInfoLog(shader)}`
        console.error(errorText);
        alert(errorText);
        return null;
    }
    this.fragmentShader = shader;
    return shader;
  }

  createVertexShader(shaderSource) {
    let gl = this.ezWebGL.getGl();
    let shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        let errorText = `An error occurred compiling the vertex shaders:  ${gl.getShaderInfoLog(shader)}`
        console.error(errorText);
        alert(errorText);
        return null;
    }
    this.vertexShader = shader;
    return shader;
  }
}