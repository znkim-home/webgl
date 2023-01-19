const {vec3, mat4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Line {
  position;
  direction;
  constructor(pos, dir) {
    this.position = pos;
    this.direction = dir;
  }
}