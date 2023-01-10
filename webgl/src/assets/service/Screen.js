import Buffer from './Buffer.js';
import Triangle from './geometry/Triangle.js';
import Renderable from './abstract/Renderable';

const { mat2, mat3, mat4, vec2, vec3, vec4 } = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Screen extends Renderable {
  coordinates;
  texture;
  forDebug;
  uniformLocation;
  constructor(coordinates, options) {
    super();
    this.forDebug = false;
    this.init(coordinates, options);
  }
  init(coordinates, options) {
    this.length = 0;
    if (coordinates) this.coordinates = coordinates;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
    if (options?.texture) this.texture = options.texture; 
    if (options?.forDebug) this.forDebug = options.forDebug;
    if (options?.uniformLocation) this.uniformLocation = options.uniformLocation;
  }
  render(gl, shaderInfo) {
    let buffer = this.getBuffer(gl, false);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
    buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);

    gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
  }
  getBuffer(gl) {
    this.dirty = (this.buffer === undefined || this.length != this.coordinates.length) ? true : false;
    if (this.dirty === true) {
      this.buffer = new Buffer(gl);
      let color = this.color;
      let selectionColor = this.selectionColor;
      let colors = [];
      let selectionColors = [];
      let positions = [];
      let normals = [];
      let textureCoordinates = [];

      let rectanglePositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.position[2]));
      let bbox = this.getMinMax(rectanglePositions);

      let leftTriangle = new Triangle(rectanglePositions[0], rectanglePositions[2], rectanglePositions[3]);
      let rightTriangle = new Triangle(rectanglePositions[0], rectanglePositions[1], rectanglePositions[2]);

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
      let indices = new Uint16Array(positions.length);
      this.buffer.indicesVBO = indices.map((obj, index) => index );
      this.buffer.positionsVBO = new Float32Array(positions);
      this.buffer.colorVBO = new Float32Array(colors);
      this.buffer.selectionColorVBO = new Float32Array(selectionColors);
      this.buffer.normalVBO = new Float32Array(normals);
      this.buffer.textureVBO = new Float32Array(textureCoordinates);
      this.buffer.texture = this.texture;
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