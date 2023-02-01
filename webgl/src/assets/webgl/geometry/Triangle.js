import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import Plane from './Plane.js';

export default class Triangle {
  positions; // [vec3, vec3, vec3]
  normal; // vec3
  plane;
  constructor(positionA, positionB, positionC) {
    this.positions = [positionA, positionB, positionC];
    this.getNormal();
  }
  get(index) {
    return this.positions[index];
  }
  getNormal() {
    if (this.normal === undefined) {
      let directionA = vec3.subtract(vec3.create(), this.positions[1], this.positions[0]);
      let directionB = vec3.subtract(vec3.create(), this.positions[2], this.positions[1]);
      let normal = vec3.cross(vec3.create(), directionA, directionB);
      vec3.normalize(normal, normal);
      this.normal = normal;
    }
    return this.normal;
  }
  getPlane() {
    if (!this.plane) {
      this.plane = new Plane(this.positions[0], this.normal);
    }
    return this.plane;
  }
}