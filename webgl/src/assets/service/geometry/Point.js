const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Point {
  index;
  pos; // vec3
  normal; // vec3
  angle; // float;

  constructor(x, y, z) {
    this.pos = vec3.fromValues(x, y, z);
    this.index = undefined;
    this.normal = undefined;
    this.angle = undefined;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  vertexNormal(a, b) {
    let result = vec3.create();
    vec2.cross(result, a, b);
    vec2.angle(a, b);
    return vec3[2];
  }
}

export class PointQueue {
  points; // [Point, Point..]
  index;
  length;
  constructor(points) {
    this.init(points);
  }

  init(points) {
    this.points = points;
    this.length = points.length;
    this.index = 0;
    this.calcNormal();
  }
  setIndex(index) {
    this.index = index;
  }
  get(index) {
    return this.points[index];
  }
  prev(index) {
    index = this.calcIndex(index, -1);
    return this.points[index];
  }
  next(index) {
    index = this.calcIndex(index, 1);
    return this.points[index];
  }
  calcIndex(index, offset) {
    if (index === undefined) {
      index = this.index;
    }
    index += offset;
    if (index >= this.length) {
      index = index % this.length;
    } else if (index < 0) {
      index = this.length + ((index) % this.length)
    }
    return index;
  }

  calcNormal() {
    this.points.forEach((point, index) => {
      let prevPoint = this.prev(index);
      let crntPoint = point;
      let nextPoint = this.next(index);
      let prevVector = vec2.fromValues(crntPoint.pos[0] - prevPoint.pos[0], crntPoint.pos[1] - prevPoint.pos[1]);
      let nextVector = vec2.fromValues(nextPoint.pos[0] - crntPoint.pos[0], nextPoint.pos[1] - crntPoint.pos[1]);
      let angle = this.calcAngle(prevVector, nextVector);
      let normal = this.calcCross(prevVector, nextVector);
      point.normal = normal;
      point.angle = angle;
      point.index = index;
    });
  }

  calcAngle(prevVector, nextVector) {
    return vec2.angle(prevVector, nextVector);
  }

  calcCross(prevVector, nextVector) {
    let result = vec3.create();
    vec2.cross(result, prevVector, nextVector);
    vec2.normalize(result, result);
    let z = result[2];
    return z;
  }

  divide(crntPoint, nearPoint) {
    let apoly = this.createQueue(crntPoint, nearPoint);
    let bpoly = this.createQueue(nearPoint, crntPoint);
    return [apoly, bpoly];
  }

  createQueue(a, b) {
    let list = [a.pos, b.pos];
    let index = b.index;
    for (var i = 0; i < this.length; i++) {
      let next = this.next(index);
      if (next == a || next == b) {
        break;
      } else {
        list.push(next.pos);
      }
      index++;
    }
    list.push(a.pos);
    list = list.map((pos) => {
      return new Point(pos[0], pos[1], pos[2]);
    })
    return new PointQueue(list);
  }

  near(index) {
    let prevPoint = this.prev(index);
    let crntPoint = this.get(index);
    let nextPoint = this.next(index);
    let filtedPoints = this.points.filter((point) => {
      if (point == prevPoint || point == crntPoint || point == nextPoint) {
        return false;
      }
      return true;
    });
    let distnaces = filtedPoints.map((point) => {
      return vec3.distance(crntPoint.pos, point.pos);
    });
    let findIndex = 0;
    let minDistance = Math.min.apply(null, distnaces);
    distnaces.find((distnace, distanceIndex) => {
      if (minDistance == distnace) {
        findIndex = distanceIndex;
        return true;
      }
      return false;
    });
    return filtedPoints[findIndex];
  }
}