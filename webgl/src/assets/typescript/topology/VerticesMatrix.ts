import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import Vertices from './Vertices';

export default class VerticesMatrix {
  _dirty: boolean;
  _verticesLength: number;
  verticesMatrix: Array<Vertices>;
  constructor(verticesMatrix?: Array<Vertices>) {
    this._dirty = false;
    this._verticesLength = 0;
    this.verticesMatrix = [];
    if (verticesMatrix) {
      verticesMatrix.forEach((vertices) => {
        this.verticesMatrix.push(vertices);
        this._verticesLength += vertices.length;
      });
    }
  }
  forEach(callback: (value: Vertices, index?: number) => void) {
    this.verticesMatrix.forEach(callback);
  }
  push(vertex: Vertices) {
    this.verticesMatrix.push(vertex);
  }
  pop(): Vertices | undefined {
    return this.verticesMatrix.pop();
  }
  get(index: number): Vertices {
    return this.verticesMatrix.get(index);
  }
  getNext(index: number): Vertices {
    return this.verticesMatrix.getNext(index);
  }
  getPrev(index: number): Vertices {
    return this.verticesMatrix.getPrev(index);
  }
  getNextIndex(index: number): number {
    return this.verticesMatrix.getNextIndex(index);
  }
  getPrevIndex(index: number): number {
    return this.verticesMatrix.getPrevIndex(index);
  }
  concat(verticesMatrix: VerticesMatrix) {
    this.verticesMatrix = this.verticesMatrix.concat(verticesMatrix.verticesMatrix);
    this._dirty = true;
  }
  get length() {
    return this.verticesMatrix.length;
  }
  set length(value: number) {
    this.verticesMatrix.length = value;
  }
  get verticesLength() {
    if (this._dirty) {
      this._verticesLength = 0;
      this.verticesMatrix.forEach((vertices) => {
        this._verticesLength += vertices.length;
      })
      this._dirty = false;
    }
    return this._verticesLength;
  }
}