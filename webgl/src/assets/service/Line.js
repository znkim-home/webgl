import Buffer from './Buffer.js';
import Renderable from './abstract/Renderable';

const { mat2, mat3, mat4, vec2, vec3, vec4 } = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Line extends Renderable {
  coordinates;
  length;

  constructor(coordinates, options) {
    super();
    this.init(coordinates, options);
  }
  init(coordinates, options) {
    this.length = 0;
    if (coordinates) this.coordinates = coordinates;
    if (options?.height) this.height = options.height;
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
  }
  render(gl, shaderInfo, renderOptions) {
    let tm = this.getTransformMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);

    let buffer = this.getBuffer(gl, false);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);

    let textureType = buffer.texture ? 1 : 0;
    textureType = (renderOptions?.textureType !== undefined) ? renderOptions?.textureType : textureType;
    gl.uniform1i(shaderInfo.uniformLocations.textureType, textureType);

    if (textureType == 4) { // selection
      buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    } else {
      buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    }
    buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    //wbuffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);

    gl.disable(gl.DEPTH_TEST);
    gl.drawElements(gl.LINE_STRIP, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
    gl.enable(gl.DEPTH_TEST);
  }
  getBuffer(gl) {
    if (this.buffer === undefined || this.length != this.coordinates.length || this.dirty === true) {
      this.buffer = new Buffer(gl);

      let colors = [];
      let selectionColors = [];
      let positions = [];

      this.coordinates.forEach((coordinate) => {
        coordinate.forEach((value) => positions.push(value));
        this.color.forEach((value) => colors.push(value));
        this.selectionColor.forEach((value) => selectionColors.push(value));
      });

      this.length = this.coordinates.length;
      let indices = new Uint16Array(this.length);
      this.buffer.indicesVBO = indices.map((obj, index) => index );
      this.buffer.positionsVBO = new Float32Array(positions);
      this.buffer.colorVBO = new Float32Array(colors);
      this.buffer.selectionColorVBO = new Float32Array(selectionColors);

      this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
      this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
      this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
      this.buffer.indicesLength = this.buffer.indicesVBO.length;

      this.dirty = false;
    }
    return this.buffer;
  }
}