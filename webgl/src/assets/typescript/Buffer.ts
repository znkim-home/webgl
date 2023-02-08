export default class Buffer {
  _gl: WebGL2RenderingContext | WebGLRenderingContext;
  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this._gl = gl;
  }
  get gl() {
    return this._gl;
  }
  bindBuffer(glBuffer: WebGLBuffer, size: number = 3, attributeLocation: number): void {
    let gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, 0, 0);
  }
  createBuffer(data: number): WebGLBuffer {
    let gl = this.gl;
    let buffer = <WebGLBuffer> gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }
  createIndexBuffer(data: number): WebGLBuffer {
    let gl = this.gl;
    let buffer = <WebGLBuffer> gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }
  createTexture(image: HTMLImageElement): WebGLTexture{
    let gl = this.gl;
    let texWrap = gl.CLAMP_TO_EDGE;
    let texture = <WebGLTexture> gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texWrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texWrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
  }
  createNoiseTexture(): WebGLTexture {
    const NOISE_SIZE = 4;
    let pixels = new Uint8Array(NOISE_SIZE * NOISE_SIZE * NOISE_SIZE);
    for (let y = 0; y < NOISE_SIZE; y++) {
			for (let x = 0; x < NOISE_SIZE; x++) {
				pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 0] = Math.floor(255 * Math.random());
				pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 1] = Math.floor(255 * Math.random());
				pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 2] = Math.floor(255 * Math.random());
				pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 3] = Math.floor(255 * Math.random());
			}
		}
    let gl = this.gl;
    let texture = <WebGLTexture> gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, NOISE_SIZE, NOISE_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
  }
}