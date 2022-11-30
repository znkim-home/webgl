const {vec3} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Triangle {
  positions; // [vec3, vec3, vec3]
  normal; // vec3
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
}