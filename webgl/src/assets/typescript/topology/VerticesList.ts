import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import Vertices from './Vertices';

export default class VerticesList {
  _dirty: boolean;
  _verticesLength: number;
  verticesList: Array<Vertices>;
  constructor(verticesList?: Array<Vertices>) {
    this._dirty = false;
    this._verticesLength = 0;
    this.verticesList = [];
    if (verticesList) {
      verticesList.forEach((vertices) => {
        this.verticesList.push(vertices);
        this._verticesLength += vertices.length;
      });
    }
  }
  forEach(callback: (value: Vertices, index?: number) => void) {
    this.verticesList.forEach(callback);
  }
  push(vertex: Vertices) {
    this.verticesList.push(vertex);
  }
  pop(): Vertices | undefined {
    return this.verticesList.pop();
  }
  get(index: number): Vertices {
    return this.verticesList.get(index);
  }
  getNext(index: number): Vertices {
    return this.verticesList.getNext(index);
  }
  getPrev(index: number): Vertices {
    return this.verticesList.getPrev(index);
  }
  getNextIndex(index: number): number {
    return this.verticesList.getNextIndex(index);
  }
  getPrevIndex(index: number): number {
    return this.verticesList.getPrevIndex(index);
  }
  concat(verticesList: VerticesList) {
    this.verticesList = this.verticesList.concat(verticesList.verticesList);
    this._dirty = true;
  }
  get length() {
    return this.verticesList.length;
  }
  set length(value: number) {
    this.verticesList.length = value;
  }
  get verticesLength() {
    if (this._dirty) {
      this._verticesLength = 0;
      this.verticesList.forEach((vertices) => {
        this._verticesLength += vertices.length;
      })
      this._dirty = false;
    }
    return this._verticesLength;
  }
}