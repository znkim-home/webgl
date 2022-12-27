export default class Buffer {
  gl = undefined;
  buffers = {};

  constructor(gl) {
    this.gl = gl;
  }
  get buffers() {
    return this.buffers;
  }

  init() {
    const result = {};
    this.buffers = result;
  }
  bindBuffer(glBuffer, size = 3, attributeLocation) {
    let gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, 0, 0);
  }
  createBuffer(data) {
    let gl = this.gl;
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }
  createIndexBuffer(data) {
    let gl = this.gl;
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }
  createTexture(image) {
    let gl = this.gl;
    let texWrap = gl.CLAMP_TO_EDGE;
    let texture = gl.createTexture();
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
  convertFaceColor(faceColors) {
    let colors = [];
    faceColors.forEach((color) => {
      colors = colors.concat(color, color, color, color);
    });
    return colors;
  }
}