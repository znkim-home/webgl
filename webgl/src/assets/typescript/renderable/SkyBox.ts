import Buffer from '../Buffer.js';
import Renderable from '../abstract/Renderable.js';
import Triangle from '../geometry/Triangle.js';
import Tessellator from '../functional/Tessellator.js';
import Indices from '../topology/Indices.js';

import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import FrameBufferObject from '../functional/FrameBufferObject.js';
import Extruder from '../functional/Extruder.js';

export default class SkyBox extends Renderable {
  height: number;
  length: number;
  coordinates: Array<Array<number>>;
  triangles: Array<Triangle>;
  image: HTMLImageElement;
  texture: WebGLTexture;

  constructor(coordinates: Array<Array<number>>, options: any) {
    super();
    this.init(coordinates, options);
  }

  init(coordinates: Array<Array<number>>, options: any) {
    this.triangles = [];
    this.height = 3.0;
    this.name = "Untitled Polygon";
    if (coordinates) this.coordinates = coordinates;
    if (options?.name) this.name = options.name;
    if (options?.height) this.height = options.height;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.rotation) this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
    if (options?.texture) this.texture = options.texture;
    if (options?.image) this.image = options.image;
  }
  render(gl: WebGLRenderingContext | WebGL2RenderingContext, shaderInfo: ShaderInfoInterface, frameBufferObjs: FrameBufferObject[]) {
    let tm = this.getTransformMatrix();
    let rm = this.getRotationMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);

    let buffer = this.getBuffer(gl);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
    buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
    buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
    buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);

    frameBufferObjs.forEach((frameBufferObj) => {
      const textureType = frameBufferObj.textureType;
      frameBufferObj.bind(shaderInfo);
      if (textureType ==  1) {
        gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
        buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
      }
      gl.drawElements(Renderable.globalOptions.drawElementsType, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
      frameBufferObj.unbind();
    });
  }
  // overriding
  getBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    if (this.buffer === undefined || this.dirty === true) {
      this.buffer = new Buffer(gl);
      let color = this.color;
      let selectionColor = this.selectionColor;
      let colors: Array<number> = [];
      let selectionColors: Array<number> = [];
      let positions: Array<number> = [];
      let normals: Array<number> = [];
      let textureCoordinates: Array<number> = [];

      //let topPositions: vec3[] = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.height));
      let bottomPositions: vec3[] = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], 0));
      
      let indicesObject = new Indices();
      let verticesList = Extruder.extrude(bottomPositions, indicesObject, this.height);
      
      let indices: Array<number> = [];
      let triangles = Extruder.convertTriangles(verticesList);
      triangles.forEach((triangle) => {
        let validation = triangle.validate();
        triangle.vertices.forEach(vertex => {
          if (validation) {
            indices.push(vertex.index);
          }
        });
      })

      verticesList.forEach((vertices) => {
        vertices.forEach((vertex, index) => {
          let position = vertex.position;
          let normal = vertex.normal;
          let color = vertex.color;
          let textureCoordinate = vertex.textureCoordinate;
          position.forEach((value) => positions.push(value));
          normal.forEach((value) => normals.push(value));
          this.color.forEach((value) => colors.push(value));
          selectionColor.forEach((value) => selectionColors.push(value));
          textureCoordinate.forEach((value) => textureCoordinates.push(value));
        });
      });
      this.buffer.indicesVBO = new Uint16Array(indices);
      this.buffer.positionsVBO = new Float32Array(positions);
      this.buffer.normalVBO = new Float32Array(normals);
      this.buffer.colorVBO = new Float32Array(colors);
      this.buffer.selectionColorVBO = new Float32Array(selectionColors);
      this.buffer.textureVBO = new Float32Array(textureCoordinates);
      if (this.image) {
        let texture = this.buffer.createTexture(this.image);
        this.buffer.texture = texture;
        this.texture = texture;
      }
      this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
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