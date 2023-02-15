import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import GeometryPlane from './GeometryPlane.js';
import Vertex from '../topology/Vertex.js';

export default class Triangle {
  vertices: Array<Vertex>;
  positions: Array<vec3>;
  textureCoorinates: Array<vec2>;
  normal: vec3;
  plane: GeometryPlane;
  constructor(position1: vec3, position2: vec3, position3: vec3) {
    this.textureCoorinates = [];
    this.positions = [position1, position2, position3];
    this.getNormal();
    let vertex = new Vertex.Builder()
      .color(vec4.fromValues(0, 0, 0, 0))
      .normal(vec3.fromValues(1, 1, 1))
      .position(position1)
      .textureCoordinate(vec2.fromValues(0, 0))
      .build();
    console.log(vertex);
  }
  get(index: number): vec3{
    return this.positions[index];
  }
  getNormal(): vec3{
    if (this.normal === undefined) {
      let directionA = vec3.subtract(vec3.create(), this.positions[1], this.positions[0]);
      let directionB = vec3.subtract(vec3.create(), this.positions[2], this.positions[1]);
      let normal = vec3.cross(vec3.create(), directionA, directionB);
      vec3.normalize(normal, normal);
      this.normal = normal;
    }
    return this.normal;
  }
  getPlane(): GeometryPlane {
    if (!this.plane) {
      this.plane = new GeometryPlane(this.positions[0], this.normal);
    }
    return this.plane;
  }
}