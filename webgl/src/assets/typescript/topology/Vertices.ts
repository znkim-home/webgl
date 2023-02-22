import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import Vertex from './Vertex';

export default class Vertices {
  vertices: Array<Vertex>;
  isCW: boolean;
  constructor(vertices?: Array<Vertex>, isCW?: boolean) {
    this.isCW = isCW ? true : false;
    this.vertices = [];
    if (vertices) {
      vertices.forEach((vertex) => {
        this.vertices.push(vertex);
      })
    }
  }
  forEach(callback: (value: Vertex, index: number) => void) {
    this.vertices.forEach(callback);
  }
  push(vertex: Vertex) {
    this.vertices.push(vertex);
  }
  pop(): Vertex | undefined {
    return this.vertices.pop();
  }
  get(index: number): Vertex {
    return this.vertices[index];
  }
  getNext(index: number): Vertex {
    return this.vertices.getNext(index);
  }
  getPrev(index: number): Vertex {
    return this.vertices.getPrev(index);
  }
  getNextIndex(index: number): number {
    return this.vertices.getNextIndex(index);
  }
  getPrevIndex(index: number): number {
    return this.vertices.getPrevIndex(index);
  }
  auto() {
    const vertices = this.vertices;
    for (let loop = 0; loop < vertices.length; loop++) {
      let prev = vertices.getPrev(loop);
      let crnt = vertices.get(loop);
      let next = vertices.getNext(loop);
      if (!crnt.normal) {
        crnt.normal = Vertices.calcNormal(prev.position, crnt.position, next.position);
      }
      if (!crnt.color) {
        crnt.color = vec4.fromValues(0.5, 0.5, 0.5, 1.0);
      }
    }
  }
  static calcNormal(prev: vec3, crnt: vec3, next: vec3): vec3{
    let directionA = vec3.subtract(vec3.create(), crnt, prev);
    let directionB = vec3.subtract(vec3.create(), next, crnt);
    let normal = vec3.cross(vec3.create(), directionA, directionB);
    return vec3.normalize(normal, normal);
  }
  get length() {
    return this.vertices.length;
  }
  set length(value: number) {
    this.vertices.length = value;
  }
}