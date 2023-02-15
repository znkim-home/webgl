import Buffer from '../../Buffer.js';
import Renderable from '../../abstract/Renderable.js';
import Tessellator from '../../functional/Tessellator.js';

import Triangle from '../../topology/Triangle.js';
import Vertex from '../../topology/Vertex.js'
import Vertices from '../../topology/Vertices.js'
import VerticesMatrix from '../../topology/VerticesMatrix.js'
import Indices from '../../topology/Indices.js';

import Revolutor from '../../functional/Revolutor.js'

import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import FrameBufferObject from '../../functional/FrameBufferObject.js';

export default class Cone extends Renderable {
  static objectName: string = "Cone";
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
    if (options?.texture) this.texture = options.texture;
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
      gl.drawElements(Renderable.globalOptions.drawElementsType, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
      frameBufferObj.unbind();
    });
  }
  // overriding
  getBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    if (this.buffer === undefined || this.dirty === true) {
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

      let outerPositions: Array<vec3> = [];
      outerPositions.push(vec3.fromValues(0.0, 0.0, this.height));
      outerPositions.push(vec3.fromValues(this.radius / 2, 0.0, 0));
      let bottomPositions: Array<vec3> = [];
      bottomPositions.push(vec3.fromValues(this.radius / 2, 0.0, 0));
      bottomPositions.push(vec3.fromValues(0, 0.0, 0.0));

      let indicesObject = new Indices();

      let outerVerticesMatrix = Revolutor.revolute(outerPositions, indicesObject, this.density);
      let bottomVerticesMatrix = Revolutor.revolute(bottomPositions, indicesObject, this.density);

      let indices: Array<number> = [];
      let outerTriangles = Revolutor.convertTriangles(outerVerticesMatrix);
      let bottomTriangles = Revolutor.convertTriangles(bottomVerticesMatrix);

      outerTriangles = outerTriangles.concat(bottomTriangles);
      outerTriangles.forEach((triangle) => {
        let validation = triangle.validate();
        triangle.vertices.forEach(vertex => {
          if (validation) {
            indices.push(vertex.index);
          }
        });
      })
      let verticesMatrix = new VerticesMatrix();
      verticesMatrix.concat(outerVerticesMatrix);
      verticesMatrix.concat(bottomVerticesMatrix);
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
      this.dirty = false;
    }
    return this.buffer;
  }
}