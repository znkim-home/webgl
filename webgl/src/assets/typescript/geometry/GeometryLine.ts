import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

export default class GeometryLine {
  position: vec3;
  direction: vec3;
  constructor(position: vec3, direction: vec3) {
    this.position = position;
    this.direction = direction;
  }
}