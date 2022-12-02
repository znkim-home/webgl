const {vec3, mat4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Line {
  position; // vec3
  direction; // vec3
  constructor(pos, dir) {
    this.position = pos;
    this.direction = dir;
  }
}