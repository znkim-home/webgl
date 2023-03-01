import Buffer from '../Buffer.js';
import Renderable from '../abstract/Renderable.js';

import Triangle from '../topology/Triangle.js';
import VerticesMatrix from '../topology/VerticesMatrix.js'
import Indices from '../topology/Indices.js'

import Revolutor from '../functional/Revolutor.js'

import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import FrameBufferObject from '../functional/FrameBufferObject.js';
import BoundingBox from '../functional/BoundingBox.js';

export default class MapTile extends Renderable {
  static objectName: string = "Elipsoid";
  height: number;
  triangles: Array<Triangle>;
  verticalRadius: number;
  horizontalRadius: number;
  density: number;
  coordinates: Array<vec3>;
  lonlatRange: any;

  texture: WebGLTexture;
  image: HTMLImageElement;

  constructor(options: any) {
    super();
    this.init(options);
  }
  init(options: any) {
    let equatorialRadius = 6378137.0; // equatorialRadius m
    let polarRadius = 6356752.3142; // polarRadius m
    this.lonlatRange = {
      latitudeMin : -90,
      latitudeMax : 0,
      longitudeMin : -180,
      longitudeMax : -90,
    };

    if (options?.lonlatRange) this.lonlatRange = options.lonlatRange;
    this.triangles = [];
    this.verticalRadius = polarRadius;
    this.horizontalRadius = equatorialRadius;
    this.height = 3.0;
    this.density = 3;
    this.name = "Untitled Cylinder";
    if (options?.verticalRadius) this.verticalRadius = options.verticalRadius;
    if (options?.horizontalRadius) this.horizontalRadius = options.horizontalRadius;
    if (options?.height) this.height = options.height;
    if (options?.density) this.density = options.density;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.rotation) this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
    if (options?.texture) this.texture = options.texture;
    if (options?.image) this.image = options.image;
  }
  rotate(xValue: number, yValue: number, tm: mat4) {
    let pitchAxis = vec3.fromValues(1, 0, 0);
    let pitchMatrix = mat4.fromRotation(mat4.create(), yValue, pitchAxis);
     return mat4.multiply(tm, tm, pitchMatrix);
  }
  render(gl: WebGLRenderingContext | WebGL2RenderingContext, shaderInfo: ShaderInfoInterface, frameBufferObjs: FrameBufferObject[]) {
    let objectRotationMatrix: mat4 = this.getRotationMatrix();
    let objectPositionHighLow: vec3[] = this.getPositionHighLow();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix);
    gl.uniform3fv(shaderInfo.uniformLocations.objectPositionHigh, objectPositionHighLow[0]);
    gl.uniform3fv(shaderInfo.uniformLocations.objectPositionLow, objectPositionHighLow[1]);

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
      let textureCoordinateLocation = shaderInfo.attributeLocations.textureCoordinate;
      if ((this.image || this.texture) && textureCoordinateLocation > -1) {
        gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
        gl.enableVertexAttribArray(textureCoordinateLocation);
        buffer.bindBuffer(buffer.textureGlBuffer, 2, textureCoordinateLocation);
      }
      gl.drawElements(Renderable.globalOptions.drawElementsType, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
      frameBufferObj.unbind();
    });
  }
  // overriding
  getBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    if (this.buffer === undefined) {
      this.buffer = new Buffer(gl);
      if (this.texture) {
        this.buffer.texture = this.texture;
      }
      let color = this.color;
      let selectionColor = this.selectionColor;
      let colors: Array<number> = [];
      let selectionColors: Array<number> = [];
      let positions: Array<number> = [];
      let normals: Array<number> = [];
      let textureCoordinates: Array<number> = [];
      
      this.coordinates = [];

      let verticalRadius = this.verticalRadius;
      let horizontalRadius = this.horizontalRadius;

      let lattitudeOffset = (this.lonlatRange.latitudeMin) + 90;
      let angleOffset = ((this.lonlatRange.latitudeMax - this.lonlatRange.latitudeMin) / this.density);
      let origin = vec3.fromValues(0.0, 0.0, 0.0);
      let verticalVec3 = vec3.fromValues(0.0, 0.0, verticalRadius);
      let horizontalVec3 = vec3.fromValues(0.0, 0.0, horizontalRadius);
      let originDot = vec3.dot(horizontalVec3, horizontalVec3);
      let radiusOffset = verticalRadius;
      for (let i = 0; i <= this.density; i++) {
        let angle = Math.radian(lattitudeOffset + (i * angleOffset));
        let rotatedHorizontalVec3 = vec3.rotateX(vec3.create(), horizontalVec3, origin, angle);
        let rotatedHorizontalDot = vec3.dot(horizontalVec3, rotatedHorizontalVec3);
        let dotRatio = (rotatedHorizontalDot / originDot);
        let addRadius = (radiusOffset * dotRatio);
        vec3.set(rotatedHorizontalVec3, rotatedHorizontalVec3[0], rotatedHorizontalVec3[1], addRadius);
        this.coordinates.push(rotatedHorizontalVec3);
      }

      let outerPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], coordinate[2]));
      let indicesObject = new Indices();
      let verticesMatrix: VerticesMatrix = Revolutor.revoluteRange(outerPositions, indicesObject, this.density, this.lonlatRange);
      let triangles: Array<Triangle> = Revolutor.convertTriangles(verticesMatrix);
      let indices: Array<number> = [];
      triangles.forEach((triangle) => {
        let validation = triangle.validate();
        triangle.vertices.forEach(vertex => {
          if (vertex.color === undefined) {
            vertex.color = this.color;
          }
          if (validation) {
            indices.push(vertex.index);
          }
        });
      })
      verticesMatrix.forEach((vertices) => {
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
    }
    return this.buffer;
  }
  createRandomColor() {
    let r = Math.round(Math.random() * 10) / 10;
    let g = Math.round(Math.random() * 10) / 10;
    let b = Math.round(Math.random() * 10) / 10;
    return vec4.fromValues(r, g, b, 1.0);
  }
  geographicToMercatorProjection(longitude: number, latitude: number): vec2 {
    let degToRadFactor = Math.PI / 180;
    let lonRad = longitude * degToRadFactor;
    let latRad = latitude * degToRadFactor;
    return this.geographicRadianToMercatorProjection(lonRad, latRad);
  }
  geographicRadianToMercatorProjection(longitude: number, latitude: number): vec2 {
    const equatorialRadius = 6378137.0;
    const PI = Math.PI;
    const x = equatorialRadius * longitude;
    let scale = 0;
    if (x !== 0) {
      scale = x / (longitude * 180 / PI);
    }
    let y = 180.0 / PI * Math.log(Math.abs(Math.tan(PI / 4.0 + latitude / 2.0))) * scale;
    return vec2.fromValues(x, y);
  }
}