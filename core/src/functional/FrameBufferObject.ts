import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

export default class FrameBufferObject {
  gl: WebGL2RenderingContext | WebGLRenderingContext;
  name: string;
  frameBuffer: WebGLFramebuffer;
  renderBuffer: WebGLRenderbuffer;
  texture: WebGLTexture;
  widths: Int32Array;
  heights: Int32Array;
  canvas: HTMLCanvasElement;
  shaderInfo: ShaderInfoInterface;
  textureType: number;
  options: any;
  globalOptions: any;
  clearColor: vec3;
  /**
   * constructor
   * @param {*} gl
   * @param {*} options 
   */
  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext, canvas: HTMLCanvasElement, shaderInfo: ShaderInfoInterface, options: any, globalOptions: any) {
    this.gl = gl;
    this.canvas = canvas;
    this.shaderInfo = shaderInfo;
    this.frameBuffer = <WebGLFramebuffer> gl.createFramebuffer();
    this.renderBuffer = <WebGLRenderbuffer> gl.createRenderbuffer();
    this.texture = <WebGLTexture> gl.createTexture();
    this.options = options;
    this.globalOptions = globalOptions;
    this.init();
  }
  init(): void {
    const gl = this.gl;
    const canvas = this.canvas;
    this.textureType = this.options?.textureType ? this.options.textureType : 0;
    this.clearColor = this.options?.clearColor ? this.options.clearColor : vec3.fromValues(1.0, 1.0, 1.0);
    this.name = this.options?.name ? this.options.name : "Untitled FrameBuffer";
    this.widths = new Int32Array([(this.options?.width) ? this.options.width : canvas.width]);
    this.heights = new Int32Array([(this.options?.height) ? this.options.height : canvas.height]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.widths[0], this.heights[0], 0, gl.RGBA, gl.UNSIGNED_BYTE, null); 
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.widths[0], this.heights[0]);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error("Incomplete frame buffer object.");
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  clear(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  bind(shaderInfo: ShaderInfoInterface = this.shaderInfo): void {
    const gl = this.gl;
    gl.uniform1i(shaderInfo.uniformLocations.textureType, this.textureType);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
  }
  unbind(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  getNormal(x: number, y: number): vec3 {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    const pixels = new Uint8Array(4);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const pixelsF32 = new Float32Array([pixels[0] / 255.0, pixels[1] / 255.0, pixels[2] / 255.0, pixels[3] / 255.0]);
    return this.decodeNormal(pixelsF32);
  }
  getColor(x: number, y: number): number {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    const pixels = new Uint8Array(4);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return this.convertColorToId(pixels);
  }
  getDepth(x: number, y: number) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    const pixels = new Uint8Array(4);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const pixelsF32 = new Float32Array([pixels[0] / 255.0, pixels[1] / 255.0, pixels[2] / 255.0, pixels[3] / 255.0]);
    const result = this.unpackDepth(pixelsF32) * this.globalOptions.far;
    return result;
  }
  convertIdToColor(id: number): vec4 {
    const calc = (value: number, div: number) => Math.floor(value / div) % 256 / 255;
    return vec4.fromValues(calc(id, 16777216), calc(id, 65536), calc(id, 256), calc(id, 1));
  }
  convertColorToId(color: Uint8Array): number {
    return (color[0] * 16777216) + (color[1] * 65536) + (color[2] * 256) + (color[3]);
  }
  convertColor255ToId(color: Uint8Array): number {
    return (color[0] * 16777216 * 255) + (color[1] * 65536 * 255) + (color[2] * 256 * 255) + (color[3] * 255);
  }
  unpackDepth(rgba_depth: vec4): number {
    return rgba_depth[0] + rgba_depth[1] * 1.0 / 255.0 + rgba_depth[2] * 1.0 / 65025.0 + rgba_depth[3] * 1.0 / 16581375.0;
  }
  decodeNormal(normal: vec4): vec3 {
    let result = vec3.fromValues(normal[0] * 2.0 - 1.0, normal[1] * 2.0 - 1.0, normal[2] * 2.0 - 1.0);
    vec3.normalize(result, result);
    return result;
  }
}