import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import FrameBufferObject from '@/functional/FrameBufferObject';

declare global {
  interface RenderableInterface {
    render(gl: WebGLRenderingContext | WebGL2RenderingContext, shaderInfo: ShaderInfoInterface, frameBufferObjs: Array<FrameBufferObject>): void;
    getBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext): BufferInterface;
    position: vec3;
  }
}

export default class Renderable implements RenderableInterface{
  id: number;
  name: string;
  buffer: any;
  position: vec3;
  rotation: vec3;
  color: vec4;
  selectionColor: vec4;
  transformMatrix: mat4;
  rotationMatrix: mat4;
  dirty: boolean;
  constructor() {
    if (this.constructor === Renderable) {
      throw new Error("Renderable is abstract class. Created an instance of an abstract class.");
    }
    this.name = "Untitled";
    this.position = vec3.fromValues(0, 0, 0);
    this.rotation = vec3.fromValues(0, 0, 0);
    this.color = vec4.fromValues(0.4, 0.4, 0.4, 1);
    this.selectionColor = vec4.fromValues(0.0, 0.0, 0.0, 1);
    this.dirty = false;
  }
  // eslint-disable-next-line no-unused-vars
  render(gl: WebGLRenderingContext | WebGL2RenderingContext, shaderInfo: ShaderInfoInterface, frameBufferObjs: Array<FrameBufferObject>): void {
    throw new Error("render() is abstract method. Abstract methods must be overriding.");
  }
  // eslint-disable-next-line no-unused-vars
  getBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext): BufferInterface { 
    throw new Error("render() is abstract method. Abstract methods must be overriding.");
  }
  getTransformMatrix(): mat4 {
    if (!this.transformMatrix || this.dirty === true) {
      let tm = mat4.create();
      mat4.identity(tm);
      mat4.rotate(tm, tm, Math.radian(this.rotation[1]), vec3.fromValues(0, 1, 0));
      mat4.rotate(tm, tm, Math.radian(this.rotation[2]), vec3.fromValues(0, 0, 1));
      mat4.rotate(tm, tm, Math.radian(this.rotation[0]), vec3.fromValues(1, 0, 0));
      tm[12] = this.position[0];
      tm[13] = this.position[1];
      tm[14] = this.position[2];
      this.transformMatrix = tm;
    }
    return this.transformMatrix;
  }
  getRotationMatrix(): mat4 {
    if (!this.rotationMatrix || this.dirty === true) {
      this.rotationMatrix = mat4.clone(this.getTransformMatrix());
      this.rotationMatrix[12] = 0;
      this.rotationMatrix[13] = 0;
      this.rotationMatrix[14] = 0;
    }
    return this.rotationMatrix;
  }
  getId(): number {
    return this.id;
  }
  calcNormal(pa: vec3, pb: vec3, pc: vec3): vec3 { // outer(cross) product 
    let d0 = vec3.create();
    let d1 = vec3.create();
    d0 = vec3.subtract(d0, pb, pa);
    d1 = vec3.subtract(d1, pc, pb);
    let normal = vec3.create();
    vec3.cross(normal, d0, d1);
    vec3.normalize(normal, normal);
    return normal;
  }
  intersection(a1: vec3, a2: vec3, b1: vec3, b2: vec3): boolean {
    let a = this.dot(this.cross(a1, a2, b1), this.cross(a1, a2, b2));
    let b = this.dot(this.cross(b1, b2, a1), this.cross(b1, b2, a2));
    return a <= 0 && b <= 0;
  }
  cross(a: vec3, b: vec3, c: vec3): vec3 {
    let d0 = vec3.subtract(vec3.create(), b, a);
    let d1 = vec3.subtract(vec3.create(), c, b);
    return vec3.cross(vec3.create(), d0, d1);
  }
  dot(a: vec3, b: vec3): number {
    return vec3.dot(a, b);
  }
  normal(a: vec3, b: vec3, c: vec3): vec3 {
    let crossed = this.cross(a, b, c);
    return vec3.normalize(crossed, crossed);
  }
  getMinMax(positions: Array<vec3>):any {
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
  convertIdToColor(id: number = this.id): vec4 {
    const calc = (value: number, div: number) => Math.floor(value / div) % 256 / 255;
    return vec4.fromValues(calc(id, 16777216), calc(id, 65536), calc(id, 256), calc(id, 1));
  }
  convertColorToId(color: vec4): number {
    return (color[0] * 16777216) + (color[1] * 65536) + (color[2] * 256) +(color[3]);
  }
  createRenderableObjectId(renderableList: RenderableListInterface): number {
    let result = this.id;
    while (result === undefined) {
      const ID_RANGE = 10000000;
      let randomId = Math.ceil(Math.random() * ID_RANGE);
      let obj = renderableList.get().find((renderableObj: Renderable) => {
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
