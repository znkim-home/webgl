export default class Shader {
  gl = undefined;
  shaderInfo = undefined;
  
  constructor(gl) {
    this.gl = gl;
  }

  get shaderInfo() {
    return this.shaderInfo;
  }

  init(vertexShaderSource, fragmentShaderSource) {
    console.info(fragmentShaderSource);
    console.info(vertexShaderSource);
    const gl = this.gl;
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    const shaderProgram = this.setShaderProgram(vertexShader, fragmentShader);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program.");
      return;
    }
    gl.useProgram(shaderProgram);
    const attributeLocations = {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    };
    const uniformLocations = {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      ModelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
    };
    this.shaderInfo = {
      shaderProgram,
      fragmentShader,
      vertexShader,
      attributeLocations,
      uniformLocations,
    }
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
  setShaderProgram(vertexShader, fragmentShader) {
    const gl = this.gl;
    const shaderProgram = gl.createProgram(); 
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    return shaderProgram;
  }
}