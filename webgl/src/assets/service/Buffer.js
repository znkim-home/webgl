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
  convertFaceColor(faceColors) {
    let colors = [];
    faceColors.forEach((color) => {
      colors = colors.concat(color, color, color, color);
    });
    return colors;
  }
}