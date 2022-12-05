import Buffer from './Buffer.js';
import Renderable from './abstract/Renderable';
import Triangle from './geometry/Triangle.js';
import Tessellator from './Tessellation/Tessellator.js';

const { mat2, mat3, mat4, vec2, vec3, vec4 } = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Polygon extends Renderable {
  height;
  coordinates;
  triangles;

  constructor(coordinates, options) {
    super();
    this.init(coordinates, options);
  }

  init(coordinates, options) {
    this.triangles = [];
    this.height = 3.0;
    if (coordinates) this.coordinates = coordinates;
    if (options?.height) this.height = options.height;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.rotation) this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
  }
  render(gl, shaderInfo) {
    let tm = this.getTransformMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);

    let buffer = this.getBuffer(gl, shaderInfo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);

    buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
    gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);//
  }
  // overriding
  getBuffer(gl) {
    if (this.buffer === undefined) {
      this.buffer = new Buffer(gl);
      let color = this.color;
      let colors = [];
      let positions = [];
      let normals = [];

      let topPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.height));
      let bottomPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], 0));
      
      if (Tessellator.validateCCW(topPositions) < 0) {
        topPositions.reverse();
        bottomPositions.reverse();
      }

      let topTriangles = Tessellator.tessellate(topPositions);
      let bottomTriangles = Tessellator.tessellate(bottomPositions, false);
      let sideTriangles = this.createSideTriangle(topPositions, bottomPositions, true);

      let triangles = [];
      triangles = triangles.concat(topTriangles);
      triangles = triangles.concat(bottomTriangles);
      triangles = triangles.concat(sideTriangles);
      this.triangles = triangles;
      triangles.forEach((triangle) => {
        let trianglePositions = triangle.positions;
        let normal = triangle.getNormal();
        //color = this.createRandomColor();
        trianglePositions.forEach((position) => { // vec3
          position.forEach((value) => positions.push(value));
          normal.forEach((value) => normals.push(value));
          color.forEach((value) => colors.push(value));
        });
      });

      let indices = new Uint16Array(positions.length);
      this.buffer.indicesVBO = indices.map((obj, index) => index);
      this.buffer.positionsVBO = new Float32Array(positions);
      this.buffer.normalVBO = new Float32Array(normals);
      this.buffer.colorVBO = new Float32Array(colors);
      this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
      this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
      this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
      this.buffer.indicesLength = this.buffer.indicesVBO.length;
    }
    return this.buffer;
  }
  createSideTriangle(topPositions, bottomPositions, isCCW = true) {
    let triangles = [];
    if (topPositions.length != bottomPositions.length) {
      throw new Error("plane length is not matched.");
    }
    let length = topPositions.length;
    for (let i = 0; i < length; i++) {
      let topA = topPositions.getPrev(i);
      let topB = topPositions.get(i);
      let bottomA = bottomPositions.getPrev(i);
      let bottomB = bottomPositions.get(i);
      if (isCCW) {
        triangles.push(new Triangle(topB, topA, bottomA));
        triangles.push(new Triangle(topB, bottomA, bottomB));
      } else {
        triangles.push(new Triangle(topB, bottomA, topA));
        triangles.push(new Triangle(topB, bottomB, bottomA));
      }
    }
    return triangles;
  }
  createRandomColor() {
    let r = Math.round(Math.random() * 10) / 10;
    let g = Math.round(Math.random() * 10) / 10;
    let b = Math.round(Math.random() * 10) / 10;
    return vec4.fromValues(r, g, b, 1.0);
  }
}