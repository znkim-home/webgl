import {Data} from './Data.js';

export default class WGLShader {
  gl = undefined;
  shaderInfo = {};
  
  constructor(gl) {
    this.gl = gl;
    this.init();
  }

  init() {
    const gl = this.gl;
    const shaderProgram = gl.createProgram(); 
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, Data.fragmentShaderSource);
    const vertexShader = this.createShader(gl.VERTEX_SHADER, Data.vertexShaderSource);

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program.");
    }

    const attributeLocations = {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor")
    };
    const uniformLocations = {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    };

    this.shaderInfo = {
      shaderProgram : shaderProgram,
      fragmentShader : fragmentShader,
      vertexShader : vertexShader,
      attributeLocations : attributeLocations,
      uniformLocations : uniformLocations,
    }
    gl.useProgram(shaderProgram);
  }

  createShader(shaderType, shaderSource) {
    const gl = this.gl;
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
      console.error(`An error occurred compiling the shaders:  ${gl.getShaderInfoLog(shader)}`);
      return null;
    }
    return shader;
  }
}