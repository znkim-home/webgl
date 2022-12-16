export default class FrameBufferObject {
  gl;
  frameBuffer;
  depthBuffer;
  texture;
  height;
  /**
   * constructor
   * @param {*} gl
   * @param {*} options 
   */
  constructor(gl, width, height) {
    /** @type {WebGLRenderingContext} */
    this.gl = gl;
    this.frameBuffer = gl.createFramebuffer();
    this.depthBuffer = gl.createRenderbuffer();
    this.texture = gl.createTexture();
    this.width = new Int32Array(1);
    this.height = new Int32Array(1);
    this.width[0] = width;
    this.height[0] = height;
    this.init();
  }

  init() {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width[0], this.height[0], 0, gl.RGBA, gl.UNSIGNED_BYTE, null); 

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width[0], this.height[0]);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error("Incomplete frame buffer object.");
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  bind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
  }
  unbind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  
  getColor(x, y) {
    /** @type {WebGLRenderingContext} */
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    const pixels = new Uint8Array(4);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return this.convertColorToId(pixels);
  }

  getDepth(x, y) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    const pixels = new Uint8Array(4);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const pixelsF32 = new Float32Array([pixels[0] / 255.0, pixels[1] / 255.0, pixels[2] / 255.0, pixels[3] / 255.0]);
    const result = this.unpackDepth(pixelsF32) * 10000;
    return result;
  }

  convertIdToColor(id) {
    const calc = (value, div) => Math.floor(value / div) % 256 / 255;
    return [calc(id, 16777216), calc(id, 65536), calc(id, 256), calc(id, 1)];
  }
  convertColorToId(color) {
    return (color[0] * 16777216) + (color[1] * 65536) + (color[2] * 256) +(color[3]);
  }
  unpackDepth(rgba_depth) {
    return rgba_depth[0] + rgba_depth[1] * 1.0 / 255.0 + rgba_depth[2] * 1.0 / 65025.0 + rgba_depth[3] * 1.0 / 16581375.0;
  }
}