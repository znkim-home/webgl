import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

import Buffer from '../Buffer.js';
import Renderable from '../abstract/Renderable.js';
import FrameBufferObject from '../functional/FrameBufferObject';

export default class BatchObject extends Renderable {
  static objectName: string = "Batched Object";
  buffer: BufferInterface;
  name: string;
  indices: Uint16Array;
  colors: Float32Array;
  selectionColors: Float32Array;
  positions: Float32Array;
  normals: Float32Array;
  textureCoordinates: Float32Array;
  textures: Array<WebGLTexture>;

  constructor(options: any) {
    super();
    this.init(options);
  }

  init(options: any): void {
    this.name = "Untitled BatchObject";
    this.indices = options.indices;
    this.colors = options.colors;
    this.selectionColors = options.selectionColors;
    this.positions = options.positions;
    this.normals = options.normals;
    this.textures = options.textures;
    this.textureCoordinates = options.textureCoordinates;
  }
  render(gl: WebGLRenderingContext | WebGL2RenderingContext, shaderInfo: ShaderInfoInterface, frameBufferObjs: FrameBufferObject[]): void {
    let objectRotationMatrix: mat4 = this.getRotationMatrix();
    let objectPositionHighLow: vec3[] = this.getPositionHighLow();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix);
    gl.uniform3fv(shaderInfo.uniformLocations.objectPositionHigh, objectPositionHighLow[0]);
    gl.uniform3fv(shaderInfo.uniformLocations.objectPositionLow, objectPositionHighLow[1]);

    let buffer = this.getBuffer(gl);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, <WebGLBuffer> buffer.indicesGlBuffer);
    if (buffer.normalGlBuffer) {
      gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
      buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
    }
    if (buffer.positionsGlBuffer) {
      gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
      buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    }
    if (buffer.colorGlBuffer) {
      gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
      buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    }
    if (buffer.selectionColorGlBuffer) {
      gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
      buffer.bindBuffer( buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
    }
    if (buffer.textureGlBuffer) {
      gl.bindTexture(gl.TEXTURE_2D, <WebGLTexture> buffer.texture);
      gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
      buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
    }
    frameBufferObjs.forEach((frameBufferObj) => {
      frameBufferObj.bind();
      if (buffer.indicesLength) {
        gl.drawElements(Renderable.globalOptions.drawElementsType, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
      }
      frameBufferObj.unbind();
    });
  }
  // overriding
  getBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext): BufferInterface {
    if (this.buffer === undefined) {
      this.buffer = new Buffer(gl);

      let selectionColor = this.selectionColor;

      let indices = this.indices;
      let colors = this.colors;
      let selectionColors = this.selectionColors;
      let positions = this.positions;
      let normals = this.normals;
      let textureCoordinates = this.textureCoordinates;
      let textures = this.textures;
      let oneSelectionColor: number[] = [];
      colors.forEach((obj, index) => {
        selectionColor.forEach((value) => oneSelectionColor.push(value));
      });
      
      this.buffer.indicesVBO = indices;
      this.buffer.colorVBO = colors;
      this.buffer.selectionColorVBO = new Float32Array(oneSelectionColor);
      this.buffer.positionsVBO = positions;
      this.buffer.texture = textures[0];
      this.buffer.normalVBO = normals;
      this.buffer.textureVBO = textureCoordinates;
      
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
      this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
      this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
      this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
      this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
      this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
      this.buffer.indicesLength = this.buffer.indicesVBO.length;
    }
    return this.buffer;
  }
}