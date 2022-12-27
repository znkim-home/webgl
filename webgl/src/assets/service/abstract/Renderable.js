const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars
// abstract
export default class Renderable {
  id;
  buffer;
  position;
  rotation;
  color;
  selectionColor;
  transformMatrix;
  dirty = false;

  constructor() {
    if (this.constructor === Renderable) {
      throw new Error("Renderable is abstract class. Created an instance of an abstract class.");
    }
    this.position = vec3.fromValues(0, 0, 0);
    this.rotation = vec3.fromValues(0, 0, 0);
    this.color = vec4.fromValues(0.5, 0.5, 0.5, 1);
    this.selectionColor = vec4.fromValues(0.0, 0.0, 0.0, 1);
  }
  render() {
    throw new Error("render() is abstract method. Abstract methods must be overriding.");
  }
  getBuffer() {
    throw new Error("render() is abstract method. Abstract methods must be overriding.");
  }
  getTransformMatrix() {
    if (!this.transformMatrix || this.dirty === true) {
      let tm = mat4.create();
      mat4.identity(tm);
      mat4.rotate(tm, tm, Math.radian(this.rotation[0]), vec3.fromValues(1, 0, 0));
      mat4.rotate(tm, tm, Math.radian(this.rotation[1]), vec3.fromValues(0, 1, 0));
      mat4.rotate(tm, tm, Math.radian(this.rotation[2]), vec3.fromValues(0, 0, 1));
      tm[12] = this.position[0];
      tm[13] = this.position[1];
      tm[14] = this.position[2];
      this.transformMatrix = tm;
    }
    return this.transformMatrix;
  }
  getId() {
    return this.id;
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
    return a <= 0 && b <= 0;
  }
  cross(a, b, c) {
    let d0 = vec3.subtract(vec3.create(), b, a);
    let d1 = vec3.subtract(vec3.create(), c, b);
    return vec3.cross(vec3.create(), d0, d1);
  }
  dot(a, b) {
    return vec3.dot(a, b);
  }
  normal(a, b, c) {
    let crossed = this.cross(a, b, c);
    return vec3.normalize(crossed, crossed);
  }
  getMinMax(positions) {
    let minx = Number.MAX_SAFE_INTEGER;
    let miny = Number.MAX_SAFE_INTEGER;
    let maxx = Number.MIN_SAFE_INTEGER;
    let maxy = Number.MIN_SAFE_INTEGER;
    positions.forEach((position) => {
      minx = position[0] < minx ? position[0] : minx;
      miny = position[1] < miny ? position[1] : miny;
      maxx = position[0] > maxx ? position[0] : maxx;
      maxy = position[1] > maxy ? position[1] : maxy;
    });
    return {
      minx : minx, 
      miny : miny, 
      maxx : maxx, 
      maxy : maxy
    }
  }
  convertIdToColor(id = this.id) {
    const calc = (value, div) => Math.floor(value / div) % 256 / 255;
    return vec4.fromValues(calc(id, 16777216), calc(id, 65536), calc(id, 256), calc(id, 1));
  }
  convertColorToId(color) {
    return (color[0] * 16777216) + (color[1] * 65536) + (color[2] * 256) +(color[3]);
  }
  createRenderableObjectId(renderableObjs) {
    let result = this.id;
    while (result === undefined) {
      let randomId = Math.ceil(Math.random() * 10000000000000);
      let obj = renderableObjs.find((renderableObj) => {
        return renderableObj.id == randomId;
      });
      if (!obj) {
        result = randomId;
        this.id = randomId;
        this.selectionColor = this.convertIdToColor(randomId);
      }
    }
    return result;
  }
}
