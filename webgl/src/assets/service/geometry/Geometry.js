const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Geometry {

  /*
    getNormal
    @param a vec2
    @parma b vec2
    @retrun result float
  */
  vertexNormal(a, b) {
    let result = vec3.create();
    vec2.cross(result, a, b);
    vec2.angle(a, b);
    return vec3[2];
  }
}

export class VertexNormal {
  prevVertex;
  mainVertex;
  nextVertex;

  prevVector;
  nextVector;

  normal;
  angle;
  ccw;
  
  constructor(prevVertex, mainVertex, nextVertex) {
    this.prevVertex = prevVertex;
    this.mainVertex = mainVertex;
    this.nextVertex = nextVertex;
    this.initVector();
    this.initAngle();
    this.initCross();
  }

  initVector() {
    let p0 = this.prevVertex;
    let p1 = this.mainVertex;
    let p2 = this.nextVertex;
    let prevVector = vec2.fromValues(p1[0] - p0[0], p1[1] - p2[1]);
    let nextVector = vec2.fromValues(p2[0] - p1[0], p2[1] - p1[1]);
    this.prevVector = prevVector;
    this.nextVector = nextVector;
  }
  initAngle() {
    this.angle = vec2.angle(this.prevVector, this.nextVector);
  }
  initCross() {
    let result = vec3.create();
    vec2.cross(result, this.prevVector, this.nextVector);
    vec2.normalize(result, result);
    let z = result[2];
    this.normal = z;
    this.ccw = z >= 0 ? true : false; 
  }

  get normal() {
    return this.normal;
  }

  get angle() {
    return this.angle;
  }

  get ccw() {
    return this.ccw;
  }

  get prevVector() {
    return this.prevVector;
  }

  get nextVextor() {
    return this.nextVextor;
  }
}

export class Concave {
  
}

export class Convex {
  
}