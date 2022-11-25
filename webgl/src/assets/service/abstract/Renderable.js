const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars
// abstract
export default class Renderable {
  buffer; // glBuffer
  pos; // position(vec3)
  rot; // rotation(vec3)
  color; // color(vec4)

  constructor() {
    if (this.constructor === Renderable) {
      throw new Error("Renderable is abstract class. Created an instance of an abstract class.");
    }
    this.pos = vec3.fromValues(0, 0, 0);
    this.rot = vec3.fromValues(0, 0, 0);
    this.color = vec4.fromValues(0.5, 0.5, 0.5, 1); // 
    this.buffer = undefined;
  }
  render() {
    throw new Error("render() is abstract method. Abstract methods must be overriding.");
  }
  getBuffer() {
    throw new Error("render() is abstract method. Abstract methods must be overriding.");
  }
  getTransformMatrix() {
    let tm = mat4.create();
    mat4.identity(tm);
    mat4.rotate(tm, tm, Math.radian(this.rot[0]), vec3.fromValues(1, 0, 0));
    mat4.rotate(tm, tm, Math.radian(this.rot[1]), vec3.fromValues(0, 1, 0));
    mat4.rotate(tm, tm, Math.radian(this.rot[2]), vec3.fromValues(0, 0, 1));
    tm[12] = this.pos[0];
    tm[13] = this.pos[1];
    tm[14] = this.pos[2];
    return tm;
  }
  calcNormal(pa, pb, pc) { // cc
    let d0 = vec3.fromValues(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]);
    let d1 = vec3.fromValues(pc[0] - pb[0], pc[1] - pb[1], pc[2] - pb[2]);
    let normal = vec3.create();
    vec3.cross(normal, d0, d1);
    vec3.normalize(normal, normal);
    return normal;
  }
}
