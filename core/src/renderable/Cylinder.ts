import Buffer from '@/Buffer.js';
import Renderable from '@/abstract/Renderable.js';
import Triangle from '../geometry/Triangle.js';
import Tessellator from '../functional/Tessellator.js';

import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import FrameBufferObject from '../functional/FrameBufferObject.js';

export default class Cylinder extends Renderable {
  height: number;
  triangles: Array<Triangle>;
  radius: number;
  density: number;
  coordinates: Array<vec2>;

  texture: WebGLTexture;
  image: HTMLImageElement;

  constructor(options: any) {
    super();
    this.init(options);
  }

  init(options: any) {
    this.triangles = [];
    this.radius = 1.0;
    this.height = 3.0;
    this.density = 36;
    this.name = "Untitled Cylinder";
    if (options?.radius) this.radius = options.radius;
    if (options?.height) this.height = options.height;
    if (options?.density) this.density = options.density;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.rotation) this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
    if (options?.image) this.image = options.image;
  }

  rotate(xValue: number, yValue: number, tm: mat4) {
    let pitchAxis = vec3.fromValues(1, 0, 0);
    let pitchMatrix = mat4.fromRotation(mat4.create(), yValue, pitchAxis);

     return mat4.multiply(tm, tm, pitchMatrix);
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

      this.coordinates = [];
      let angleOffset = (360 / this.density);
      let origin = vec2.fromValues(0.0, 0.0);
      
      let rotateVec2 = vec2.fromValues(0.0, 0.0 + this.radius);
      for (let i = 0; i < this.density; i++) {
        let angle = Math.radian(i * angleOffset);
        let rotated = vec2.rotate(vec2.create(), rotateVec2, origin, angle);
        this.coordinates.push(rotated);
      }

      let topPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.height));
      let bottomPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], 0.0));
      let bbox = this.getMinMax(topPositions);
      bbox.minz = this.position[2];
      bbox.maxz = this.position[2] + this.height;

      if (Tessellator.validateCCW(topPositions) < 0) {
        topPositions.reverse();
        bottomPositions.reverse();
      }
      
      let topOrigin = vec3.fromValues(0.0, 0.0, this.height);
      let topTriangles = topPositions.map((topPosition, index) => {
        let nextPosition = topPositions.getNext(index);
        return new Triangle(topOrigin, topPosition, nextPosition);
      });
      let bottomOrigin = vec3.fromValues(0.0, 0.0, 0.0);
      let bottomTriangles = bottomPositions.map((bottomPosition, index) => {
        let nextPosition = bottomPositions.getNext(index);
        return new Triangle(bottomOrigin, nextPosition, bottomPosition);
      });
      let sideTriangles = this.createSideTriangle(topPositions, bottomPositions, true);

      let triangles: Triangle[] = [];
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
  createSideTriangle(topPositions: vec3[], bottomPositions: vec3[], isCCW: boolean = true) {
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