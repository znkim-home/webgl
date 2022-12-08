import Buffer from './Buffer.js';
import Triangle from './geometry/Triangle.js';
import Renderable from './abstract/Renderable';

const { mat2, mat3, mat4, vec2, vec3, vec4 } = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Rectangle extends Renderable {
  coordinates;
  image;
  texture;
  reverse;

  constructor(coordinates, options) {
    super();
    this.init(coordinates, options);
  }
  init(coordinates, options) {
    this.length = 0;
    this.reverse = false;
    
    if (coordinates) this.coordinates = coordinates;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
    if (options?.texture) this.texture = options.texture; 
    if (options?.image && !options?.texture) this.image = options.image;
    if (options?.reverse) this.reverse = true; 
  }
  render(gl, shaderInfo, renderOptions) {
    let tm = this.getTransformMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);

    let buffer = this.getBuffer(gl, false);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);

    if (buffer.texture) {
      gl.uniform1i(shaderInfo.uniformLocations.textureType, this.reverse ? 2 : 1);
      if (renderOptions?.textureType !== undefined) gl.uniform1i(shaderInfo.uniformLocations.textureType, renderOptions?.textureType);
      gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
    }
    
    buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
    buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);

    gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
  }
  getBuffer(gl) {
    if (this.buffer === undefined || this.length != this.coordinates.length) {
      this.buffer = new Buffer(gl);
      let color = this.color;
      let colors = [];
      let positions = [];
      let normals = [];
      let textureCoordinates = [];

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
      this.buffer.normalVBO = new Float32Array(normals);
      this.buffer.textureVBO = new Float32Array(textureCoordinates);

      if (this.texture) {
        this.buffer.texture = this.texture;
      } else if (!this.texture && this.image) {
        this.buffer.texture = this.buffer.createTexture(this.image);
      }

      this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
      this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
      this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
      this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
      this.buffer.indicesLength = this.buffer.indicesVBO.length;
    }
    return this.buffer;
  }
}