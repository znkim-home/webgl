const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars
//import Point from './Point.js';

export default class Triangle {
  points; // [Point, Point, Point]
  normal; // [vec3]

  constructor(pointA, pointB, pointC) {
    //this.positions = [a, b, c];
    this.points = [pointA, pointB, pointC];
    this.initNormal(pointA.pos, pointB.pos, pointC.pos);
  }

  get(index) {
    return this.points[index];
  }

  getVector(index) {
    return this.points.pos[index];
  }
  
  initNormal(a, b, c) { // cc
    let prev = vec3.fromValues(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    let next = vec3.fromValues(c[0] - b[0], c[1] - b[1], c[2] - b[2]);
    let normal = vec3.create();
    vec3.cross(normal, prev, next);
    vec3.normalize(normal, normal);
    this.normal = normal;
    return normal;
  }
}