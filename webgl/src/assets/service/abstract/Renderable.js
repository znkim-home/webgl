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
  calcNormal(pa, pb, pc) { // outer(cross) product 
    let d0 = vec3.create();
    let d1 = vec3.create();
    d0 = vec3.subtract(d0, pb, pa);
    d1 = vec3.subtract(d1, pc, pb);
    let normal = vec3.create();
    vec3.cross(normal, d0, d1);
    vec3.normalize(normal, normal);
    return normal;
  }

  intersection(a1, a2, b1, b2) {
    let a = this.dot(this.cross(a1, a2, b1), this.cross(a1, a2, b2));
    let b = this.dot(this.cross(b1, b2, a1), this.cross(b1, b2, a2));
    if (a == 0 && b == 0) {
      console.log("준비되지 않은 케이스");
    }
    console.log(a, b)
    return a <= 0 && b <= 0;
  }

  cross(a, b, c) { // outer(cross) product 
    let d0 = vec3.subtract(vec3.create(), b, a);
    let d1 = vec3.subtract(vec3.create(), c, b);
    return vec3.cross(vec3.create(), d0, d1);
  }

  dot(a, b) { // outer(cross) product 
    //let d0 = vec3.fromValues(a[0], a[1], a[2]);
    //let d1 = vec3.fromValues(b[0], b[1], b[2]);
    return vec3.dot(a, b);
  }

  normal(a, b, c) {
    let crossed = this.cross(a, b, c);
    return vec3.normalize(crossed, crossed);
  }
}
