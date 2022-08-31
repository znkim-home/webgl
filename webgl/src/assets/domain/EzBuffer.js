import {indices, positions, textureCoordinates, vertexNormals} from './EzData.js';

export class EzBuffer {
  constructor(ezWebGL) {
    this.fixedUrl = 'https://picsum.photos/256/256';
    this.ezWebGL = ezWebGL;
    this.buffers = this.initBuffer();
    this.texture = this.loadTexture('https://picsum.photos/256/256');
    this.savedImage = undefined;
    this.hasImage = false;
  }

  reloadTexture() {
    this.loadTexture(`${this.fixedUrl}?ver=${new Date().getTime()}`);
  }

  startInterval() {
    //setInterval(this.reloadTexture.bind(this), 16);
    setInterval(this.reloadTexture.bind(this), 500);
  }

  getTexture() {
    return this.texture;
  }

  getBuffers() {
    return this.buffers;
  }

  initBuffer() {
    //let colors = this.convertFaceColor(faceColors);
    return {
      position : this.createBuffer(positions),
      normal : this.createBuffer(vertexNormals),
      //color : this.createBuffer(colors),
      textureCoord:  this.createBuffer(textureCoordinates),
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

  loadTexture(url) {
    let gl = this.ezWebGL.getGl();
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([10, 10, 16, 256]);
    
    let image = new Image();
    const that = this;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
    image.crossOrigin = "";
    image.onload = function() {
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
      if (that.isPowerOf2(image.width) && that.isPowerOf2(image.height)) {
          gl.generateMipmap(gl.TEXTURE_2D);
      } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      that.hasImage = true;
    };
    image.src = url;
    return texture;
  }

  isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }
}