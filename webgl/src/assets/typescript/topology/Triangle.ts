import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import Vertex from '../topology/Vertex.js';

export default class Triangle {
  vertices: Array<Vertex>;
  textureCoorinates: Array<vec2>;
  normal: vec3;
  constructor(verticeA: Vertex, verticeB: Vertex, verticeC: Vertex) {
    this.vertices = [verticeA, verticeB, verticeC];
    this.calcNormal();
  }
  get(index: number): Vertex {
    return this.vertices[index];
  }
  getA(): Vertex {
    return this.vertices[0];
  }
  getB(): Vertex {
    return this.vertices[1];
  }
  getC(): Vertex {
    return this.vertices[2];
  }
  calcNormal(isCw?: boolean): vec3{
    let vertices = this.vertices;
    if (this.normal === undefined) {
      let directionA = vec3.subtract(vec3.create(), vertices[0].position, vertices[1].position);
      let directionB = vec3.subtract(vec3.create(), vertices[1].position, vertices[2].position);
      if (isCw) {
        let normal = vec3.cross(vec3.create(), directionB, directionA);
        this.normal = vec3.normalize(normal, normal);
      } else {
        let normal = vec3.cross(vec3.create(), directionA, directionB);
        this.normal = vec3.normalize(normal, normal);
      }
      this.vertices.forEach((vertex) => {
        vertex.normal = this.normal;
      })
    }
    return this.normal;
  }
  get length(): number {
    return this.vertices.length;
  }
  validate(): boolean {
    let vertices = this.vertices;
    let samePosition = vec3.equals(vertices[0].position, vertices[1].position) || vec3.equals(vertices[0].position, vertices[2].position) || vec3.equals(vertices[1].position, vertices[2].position);
    return !samePosition;
  }
}