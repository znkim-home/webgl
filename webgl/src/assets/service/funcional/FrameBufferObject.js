export default class FrameBufferObject {
  gl;
  
  frameBuffer;
  depthBuffer; // not yet
  texture; // not yet

  width;
  height;

  /**
   * 
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
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
  }

  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
}