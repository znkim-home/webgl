import Buffer from './Buffer.js';
import Renderable from './abstract/Renderable';
import Triangle from './geometry/Triangle.js';
import Tessellator from './Tessellation/Tessellator.js';

const { mat2, mat3, mat4, vec2, vec3, vec4 } = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Polygon extends Renderable {
  height;
  coordinates;
  triangles;
  image;

  constructor(coordinates, options) {
    super();
    this.init(coordinates, options);
  }

  init(coordinates, options) {
    this.triangles = [];
    this.height = 3.0;
    this.name = "Untitled Polygon";
    if (coordinates) this.coordinates = coordinates;
    if (options?.name) this.name = options.name;
    if (options?.height) this.height = options.height;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.rotation) this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
    if (options?.image) this.image = options.image;
  }
  render(gl, shaderInfo, frameBufferObjs) {
    let tm = this.getTransformMatrix();
    let rm = this.getRotationMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);

    let buffer = this.getBuffer(gl, shaderInfo);
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
      gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
      frameBufferObj.unbind();
    });
  }
  // overriding
  getBuffer(gl) {
    if (this.buffer === undefined || this.dirty === true) {
      this.buffer = new Buffer(gl);
      let color = this.color;
      let selectionColor = this.selectionColor;
      let colors = [];
      let selectionColors = [];
      let positions = [];
      let normals = [];
      let textureCoordinates = [];

      //let topPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.position[2] + this.height));
      //let bottomPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.position[2]));
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

      let indices = new Uint16Array(positions.length);
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