import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import GeometryLine from './GeometryLine';

export default class GeometryPlane {
  position: vec3;
  normal: vec3;
  distance: number;
  constructor(position: vec3, normal: vec3) {
    this.set(position, normal);
  }
  set(position: vec3, normal: vec3): void {
    this.normal = normal;
    this.position = position;
    this.distance = -(normal[0] * position[0] + normal[1] * position[1] + normal[2] * position[2]);
  }
  getIntersection(line: GeometryLine): vec3 | null {
    let normal = this.normal;
    let position = line.position;
    let direction = line.direction;
    
    let test = (normal[0] * direction[0]) + (normal[1] * direction[1]) + (normal[2] * direction[2]);

    if (Math.abs(test) > Number.MIN_VALUE) {
      let lambda = -((normal[0] * position[0] + normal[1] * position[1] + normal[2] * position[2] + this.distance) / test);
      let x = position[0] + lambda * direction[0];
      let y = position[1] + lambda * direction[1];
      let z = position[2] + lambda * direction[2];
      return vec3.fromValues(x, y, z)
    } else {
      return null;
    }
  }
}