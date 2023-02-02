import Buffer from '@/Buffer.js';
import Renderable from '@/abstract/Renderable.js';
import Triangle from '@/geometry/Triangle.js';

import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import FrameBufferObject from '../functional/FrameBufferObject';

export default class Rectangle extends Renderable {
  length: number;
  coordinates: Array<Array<number>>;
  image: HTMLImageElement;
  texture: WebGLTexture;

  constructor(coordinates: Array<Array<number>>, options: any) {
    super();
    this.init(coordinates, options);
  }
  init(coordinates: Array<Array<number>>, options: any) {
    this.length = 0;
    this.name = "Untitled Rectangle";
    if (options?.id) {
      this.id = options.id;
      this.selectionColor = this.convertIdToColor(options.id);
    }
    if (coordinates) this.coordinates = coordinates;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
    if (options?.texture) this.texture = options.texture; 
    if (options?.image && !options?.texture) this.image = options.image;
  }
  render(gl: WebGLRenderingContext | WebGL2RenderingContext, shaderInfo: ShaderInfoInterface, frameBufferObjs: FrameBufferObject[]) {
    let tm = this.getTransformMatrix();
    let rm = this.getRotationMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);

    let buffer = this.getBuffer(gl);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
    buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
    buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
    buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);

    frameBufferObjs.forEach((frameBufferObj) => {
      frameBufferObj.bind(shaderInfo);
      if (this.image || this.texture) {
        gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
        buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
      }
      gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
      frameBufferObj.unbind();
    });
  }
  getBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.dirty = (this.buffer === undefined || this.length != this.coordinates.length);
    if (this.dirty === true) {
      this.buffer = new Buffer(gl);
      let color = this.color;
      let selectionColor = this.selectionColor;
      let colors: Array<number> = [];
      let selectionColors: Array<number> = [];
      let positions: Array<number> = [];
      let normals: Array<number> = [];
      let textureCoordinates: Array<number> = [];

      let rectanglePositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.position[2]));
      let bbox = this.getMinMax(rectanglePositions);

      let leftTriangle = new Triangle(rectanglePositions[0], rectanglePositions[1], rectanglePositions[2]);
      let rightTriangle = new Triangle(rectanglePositions[0], rectanglePositions[2], rectanglePositions[3]);

      let triangles = [leftTriangle, rightTriangle];
      triangles.forEach((triangle) => {
        let trianglePositions = triangle.positions;
        let normal = triangle.getNormal();
        trianglePositions.forEach((position) => { // vec3
          position.forEach((value) => {positions.push(value)});
          normal.forEach((value) => normals.push(value));
          color.forEach((value) => colors.push(value));
          selectionColor.forEach((value) => selectionColors.push(value));
          let rangeX = bbox.maxx - bbox.minx;
          let rangeY = bbox.maxy - bbox.miny;
          textureCoordinates.push((position[0] - bbox.minx) / rangeX);
          textureCoordinates.push((position[1] - bbox.miny) / rangeY);
        });
      });

      this.length = this.coordinates.length;
      let indices = new Uint16Array(positions.length/3);
      this.buffer.indicesVBO = indices.map((obj, index) => index);
      this.buffer.positionsVBO = new Float32Array(positions);
      this.buffer.colorVBO = new Float32Array(colors);
      this.buffer.selectionColorVBO = new Float32Array(selectionColors);
      this.buffer.normalVBO = new Float32Array(normals);
      this.buffer.textureVBO = new Float32Array(textureCoordinates);
      if (this.texture) {
        this.buffer.texture = this.texture;
      } else if (!this.texture && this.image) {
        let texture = this.buffer.createTexture(this.image);
        this.buffer.texture = texture;
        this.texture = texture;
      }
      this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
      this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
      this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
      this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
      this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
      this.buffer.indicesLength = this.buffer.indicesVBO.length;
      this.dirty = false;
    }
    return this.buffer;
  }
}