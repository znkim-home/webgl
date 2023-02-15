import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';

export default class Indices {
  indices: number;
  constructor() {
    this.init();
  }
  init() {
    this.indices = 0;
  }
  get(): number {
    return this.indices;
  }
  next(): void {
    this.indices++;
  }
  getAndNext(): number {
    let result = this.indices;
    this.next();
    return result;
  }
}