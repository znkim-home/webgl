import {Data} from './Data.js';

export default class WGLBuffer {
  gl = undefined;
  buffers = {};

  constructor(gl) {
    this.gl = gl;
    this.buffers = this.initBuffer();
  }

  get buffers() {
    return this.buffers;
  }

  initBuffer() {
    const colors = this.convertFaceColor(Data.colors);
    return {
      positions : this.createBuffer(Data.positions),
      colors : this.createBuffer(colors),
      indices : this.createIndexBuffer(Data.indices),
    }
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