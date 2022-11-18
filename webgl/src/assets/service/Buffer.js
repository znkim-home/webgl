export default class Buffer {
  gl = undefined;
  buffers = {};

  constructor(gl) {
    this.gl = gl;
  }

  get buffers() {
    return this.buffers;
  }

  init(data) {
    const colors = this.convertFaceColor(data.colors);
    const result = {
      positions : this.createBuffer(data.positions),
      colors : this.createBuffer(colors),
      indices : this.createIndexBuffer(data.indices),
    }
    this.buffers = result;
    return result;
  }

  createBuffer(data, dataType) {
    let gl = this.gl;
    let buffer = gl.createBuffer();
    const DataType = dataType || Float32Array;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new DataType(data), gl.STATIC_DRAW);
    return buffer;
  }

  createIndexBuffer(data, dataType) {
    let gl = this.gl;
    let buffer = gl.createBuffer();
    const DataType = dataType || Uint16Array;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new DataType(data), gl.STATIC_DRAW);
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