import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

export default class Shader {
  _gl: WebGLRenderingContext | WebGL2RenderingContext;
  _shaderInfo: ShaderInfoInterface;
  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this._gl = gl;
  }
  get gl(): WebGLRenderingContext | WebGL2RenderingContext{
    return this._gl;
  }
  get shaderInfo(): ShaderInfoInterface{
    return this._shaderInfo;
  }
  init(shaderObject: ShaderObjectInterface): void {
    const gl = this.gl;
    const vertexShader = this.createShader(gl.VERTEX_SHADER, shaderObject.vertexShaderSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, shaderObject.fragmentShaderSource);
    const shaderProgram = <WebGLProgram> this.createShaderProgram(vertexShader, fragmentShader);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program.");
      return;
    }
    gl.useProgram(shaderProgram);

    let attributeLocations: any = {};
    shaderObject.attributes.forEach((attribute) => {
      if (attribute[0] !== 'a') {
        throw new Error("Shader: attribute variable name is incorrect.");
      }
      let result = attribute.replace('a', '');
      result = result.replace(/^[A-Z]/, char => char.toLowerCase());
      attributeLocations[result] = gl.getAttribLocation(shaderProgram, attribute);
    });
    let uniformLocations: any = {};
    shaderObject.uniforms.forEach((uniform) => {
      if (uniform[0] !== 'u') {
        throw new Error("Shader: uniform variable name is incorrect.");
      }
      let result = uniform.replace('u', '');
      result = result.replace(/^[A-Z]/, char => char.toLowerCase());
      uniformLocations[result] = gl.getUniformLocation(shaderProgram, uniform);
    });
    this._shaderInfo = {
      shaderProgram,
      fragmentShader,
      vertexShader,
      attributeLocations,
      uniformLocations,
    }
  }
  createShader(shaderType: number, shaderSource: string): WebGLShader {
    const gl = this.gl;
    const shader = <WebGLShader> gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
      let message = `An error occurred compiling the shaders:  ${gl.getShaderInfoLog(shader)}`;
      throw new Error(message);
    }
    return shader;
  }
  createShaderProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const gl = this.gl;
    const shaderProgram = <WebGLProgram> gl.createProgram(); 
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    return shaderProgram;
  }
  useProgram(): void {
    this.gl.useProgram(this.shaderInfo.shaderProgram);
  } 
}