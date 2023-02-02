import Buffer from '@/Buffer.js';
import Renderable from '@/abstract/Renderable.js';
import Triangle from '@/geometry/Triangle';

import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import FrameBufferObject from '../functional/FrameBufferObject';

export default class Obj extends Renderable {
  triangles: Array<Triangle>;
  radius: number;
  height: number;
  length: number;
  scale: number;
  image: HTMLImageElement;
  texture: WebGLTexture;
  objData: any;

  constructor(options: any, objData: any) {
    super();
    this.init(options, objData);
  }
  init(options: any, objData: any) {
    this.triangles = [];
    this.radius = 1.0;
    this.height = 3.0;
    this.scale = 1.0;
    this.name = "Untitled OBJ File";

    if (options?.radius) this.radius = options.radius;
    if (options?.height) this.height = options.height;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.rotation) this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
    if (options?.image) this.image = options.image;
    if (options?.scale) this.scale = options.scale;

    this.objData = objData;
  }
  render(gl: WebGLRenderingContext | WebGL2RenderingContext, shaderInfo: ShaderInfoInterface, frameBufferObjs: FrameBufferObject[]) {
    let tm = this.getTransformMatrix();
    let rm = this.getRotationMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
    let buffer = this.getBuffer(gl);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
    buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
    buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
    buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
    frameBufferObjs.forEach((frameBufferObj) => {
      frameBufferObj.bind();
      if (this.image || this.texture) {
        gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
        buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
      }
      gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
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
      let coordinates: Array<vec3> = [];

      let objData = this.objData;

      let scaler = this.scale;

      let minX = Number.MAX_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;
      let minZ = Number.MAX_SAFE_INTEGER;
      let maxX = Number.MIN_SAFE_INTEGER;
      let maxY = Number.MIN_SAFE_INTEGER;
      let maxZ = Number.MIN_SAFE_INTEGER;

      let triangles: Triangle[] = [];
      objData.vertices.forEach((vertice: string) => {
        let xyz: string[] = vertice.split(" ").filter(block => block !== '');
        let x = parseFloat(xyz[0]) * scaler;
        let y = parseFloat(xyz[1]) * scaler;
        let z = parseFloat(xyz[2]) * scaler;
        coordinates.push(vec3.fromValues(x, z, y));
      });

      let allCoordinates: vec3[] = [];
      objData.allVertices.forEach((vertice: string) => {
        let xyz: string[] = vertice.split(" ").filter(block => block !== '');
        let x = parseFloat(xyz[0]) * scaler;
        let y = parseFloat(xyz[1]) * scaler;
        let z = parseFloat(xyz[2]) * scaler;

        if (minX > x) minX = x;
        if (minY > y) minY = y;
        if (minZ > z) minZ = z;
        if (maxX < x) maxX = x;
        if (maxY < y) maxY = y;
        if (maxZ < z) maxZ = z;
        allCoordinates.push(vec3.fromValues(x, z, y));
      });
      
      objData.faces.forEach((face: string) => {
        let splitedFaces = face.split(" ").filter(block => block !== '');
        let length = splitedFaces.length;
        if (length >= 3) {
          let face = splitedFaces.map((theIndex) => {
            return parseInt(theIndex.split("/")[0]);
          })
          let theCoordinates = face.map((theIndex) => {
            if (theIndex < 0) {
              return coordinates[coordinates.length + theIndex];
            } else {
              return allCoordinates[theIndex - 1];
            }
          });
          for (let loop = 2; loop < length; loop++) {
            triangles.push(new Triangle(theCoordinates[0], theCoordinates[loop], theCoordinates[loop-1]));
            color.forEach((value) => colors.push(value));
            color.forEach((value) => colors.push(value));
            color.forEach((value) => colors.push(value));
          }
        } 
      });

      triangles.forEach((triangle) => {
        let trianglePositions = triangle.positions;
        let normal = triangle.getNormal();
        trianglePositions.forEach((position) => { // vec3
          position.forEach((value) => positions.push(value));
          normal.forEach((value) => normals.push(value));
          selectionColor.forEach((value) => selectionColors.push(value));
        });
      });

      let indices = new Uint16Array(positions.length);
      this.buffer.indicesVBO = indices.map((obj, index) => index);
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