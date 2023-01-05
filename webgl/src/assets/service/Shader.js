const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Shader {
  gl = undefined;
  shaderInfo = undefined;
  constructor(gl) {
    this.gl = gl;
  }
  get shaderInfo() {
    return this.shaderInfo;
  }
  init(shaderObject) {
    const gl = this.gl;
    const vertexShader = this.createShader(gl.VERTEX_SHADER, shaderObject.vertexShaderSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, shaderObject.fragmentShaderSource);
    const shaderProgram = this.createShaderProgram(vertexShader, fragmentShader);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program.");
      return;
    }
    gl.useProgram(shaderProgram);

    let attributeLocations = {};
    shaderObject.attributes.forEach((attribute) => {
      if (attribute[0] !== 'a') {
        throw "Shader: attribute variable name is incorrect.";
      }
      let result = attribute.replace('a', '');
      result = result.replace(/^[A-Z]/, char => char.toLowerCase());
      attributeLocations[result] = gl.getAttribLocation(shaderProgram, attribute);
    });
    let uniformLocations = {};
    shaderObject.uniforms.forEach((uniform) => {
      if (uniform[0] !== 'u') {
        throw "Shader: uniform variable name is incorrect.";
      }
      let result = uniform.replace('u', '');
      result = result.replace(/^[A-Z]/, char => char.toLowerCase());
      //return result
      uniformLocations[result] = gl.getUniformLocation(shaderProgram, uniform);
    });
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
  createShaderProgram(vertexShader, fragmentShader) {
    const gl = this.gl;
    const shaderProgram = gl.createProgram(); 
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    return shaderProgram;
  }
  useProgram() {
    //console.log("useprogram");
    this.gl.useProgram(this.shaderInfo.shaderProgram);
  } 
}