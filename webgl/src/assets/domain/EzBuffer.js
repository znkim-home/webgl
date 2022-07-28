import {indices, faceColors, positions} from './EzData.js';

export class EzBuffer {
  constructor(ezWebGL) {
    this.ezWebGL = ezWebGL;
    this.buffers = this.initBuffer();
  }

  getBuffers() {
    return this.buffers;
  }

  initBuffer() {
    let colors = this.convertFaceColor(faceColors);
    return {
      position : this.createBuffer(positions),
      color : this.createBuffer(colors),
      index : this.createIndexBuffer(indices),
    }
  }

  createBuffer(data) {
    let gl = this.ezWebGL.getGl();
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
  }

  createIndexBuffer(indices) {
    let gl = this.ezWebGL.getGl();
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    return indexBuffer;
  }

  convertFaceColor(faceColors) {
    let colors = [];
    faceColors.forEach((color) => {
      colors = colors.concat(color, color, color, color)
    });
    return colors;
  }
}