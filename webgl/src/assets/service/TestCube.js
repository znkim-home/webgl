import Buffer from './Buffer.js';
import Renderable from './abstract/Renderable.js';
import Tessellator from './Tessellation/Tessellator.js';
import Triangle from './geometry/Triangle.js';

const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class TestCube extends Renderable {
  size;
  constructor() {
    super();
    this.init();
  }
  
  init() {
    this.height = 128;
    this.size = vec3.fromValues(128, 128, 128); // size : width, length, height
    this.name = "Untitled Cube";
    this.position = vec3.set(this.position, 0.0, 0.0, -3.0);
    this.rotation = vec3.set(this.rotation, 1.0, 45.0, 1.0);
    this.color = vec4.set(this.color, 1.0, 0.7, 1.0, 1.0);
  }
  // overriding
  render(gl, shaderInfo) {
    let tm = this.getTransformMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);

    let buffer = this.getBuffer(gl, shaderInfo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
    buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);

    gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
  }
  // overriding
  getBuffer(gl) {
    this.dirty = (this.buffer === undefined) ? true : false;
    if (this.dirty === true) {
      this.buffer = new Buffer(gl);
      
      let color = this.color;
      let selectionColor = this.selectionColor;
      let colors = [];
      let selectionColors = [];
      let positions = [];
      let normals = [];
      let textureCoordinates = [];

      this.coordinates = [[-64, -64], [64, -64], [64, 64], [-64, 64]];
      
      let topPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.height));
      let bottomPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], 0));
      let bbox = this.getMinMax(topPositions);
      bbox.minz = 0;
      bbox.maxz = this.height;
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
        trianglePositions.forEach((position) => { // vec3
          position.forEach((value) => positions.push(value));
          normal.forEach((value) => normals.push(value));
          color.forEach((value) => colors.push(value));
          selectionColor.forEach((value) => selectionColors.push(value));
          let xoffset = bbox.maxx - bbox.minx;
          let yoffset = bbox.maxy - bbox.miny;
          let zoffset = bbox.maxz - bbox.minz;
          if (normal[0] == 1 || normal[0] == -1) {
            textureCoordinates.push((position[1] - bbox.miny) / yoffset);
            textureCoordinates.push((position[2] - bbox.minz) / zoffset);
          } else if (normal[1] == 1 || normal[1] == -1) {
            textureCoordinates.push((position[0] - bbox.minx) / xoffset);
            textureCoordinates.push((position[2] - bbox.minz) / zoffset);
          } else if (normal[2] == 1 || normal[2] == -1) {
            textureCoordinates.push((position[0] - bbox.minx) / xoffset);
            textureCoordinates.push((position[1] - bbox.miny) / yoffset);
          }
        });
      });

      let indices = new Uint16Array(positions.length/3);
      this.buffer.indicesVBO = indices.map((obj, index) => index);
      this.buffer.positionsVBO = new Float32Array(positions);
      this.buffer.normalVBO = new Float32Array(normals);
      this.buffer.colorVBO = new Float32Array(colors);
      this.buffer.selectionColorVBO = new Float32Array(selectionColors);
      this.buffer.textureVBO = new Float32Array(textureCoordinates);
      if (this.image) {
        this.buffer.texture = this.buffer.createTexture(this.image);
      }
      this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
      console.log(this.buffer.positionsVBO);
      this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
      console.log(this.buffer.colorVBO);
      this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
      console.log(this.buffer.selectionColorVBO);
      this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
      console.log(this.buffer.normalVBO);
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
      console.log(this.buffer.indicesVBO);
      this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
      console.log(this.buffer.textureVBO);
      this.buffer.indicesLength = this.buffer.indicesVBO.length;
      this.dirty = false;
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