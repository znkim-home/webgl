import Buffer from '@/Buffer.js';
import Renderable from '@/abstract/Renderable.js';

import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import FrameBufferObject from '../functional/FrameBufferObject';

export default class Line extends Renderable {
  coordinates: Array<Array<number>>;
  length: number;
  height: number;

  constructor(coordinates: Array<Array<number>>, options: any) {
    super();
    this.init(coordinates, options);
  }
  init(coordinates: Array<Array<number>>, options: any) {
    this.length = 0;
    this.name = "Untitled Line";
    if (coordinates) this.coordinates = coordinates;
    if (options?.height) this.height = options.height;
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
  }
  render(gl: WebGLRenderingContext | WebGL2RenderingContext, shaderInfo: ShaderInfoInterface, frameBufferObjs: FrameBufferObject[]) {
    let tm = this.getTransformMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);

    let buffer = this.getBuffer(gl);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);

    // todo

    gl.disable(gl.DEPTH_TEST);
    gl.drawElements(gl.LINE_STRIP, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
    gl.enable(gl.DEPTH_TEST);
  }
  getBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    if (this.buffer === undefined || this.length != this.coordinates.length || this.dirty === true) {
      this.buffer = new Buffer(gl);

      let colors: Array<number> = [];
      let selectionColors: Array<number> = [];
      let positions: Array<number> = [];

      this.coordinates.forEach((coordinate) => {
        coordinate.forEach((value) => positions.push(value));
        this.color.forEach((value) => colors.push(value));
        this.selectionColor.forEach((value) => selectionColors.push(value));
      });

      this.length = this.coordinates.length;
      let indices = new Uint16Array(this.length);
      this.buffer.indicesVBO = indices.map((obj, index) => index);
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