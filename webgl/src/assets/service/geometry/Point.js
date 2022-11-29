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
    this.checkIntersection(crntPoint, nearPoint);

    let apoly = this.createQueue(crntPoint, nearPoint, true);
    let bpoly = this.createQueue(nearPoint, crntPoint, false);
    return [apoly, bpoly];
  }

  checkIntersection(a, b) {
    for (var i = 0; i < this.length; i++) {
      let crnt = this.get(i);
      let next = this.next(i);
      
      let result = this.intersection(a.pos, b.pos, crnt.pos, next.pos);
      if (result) {
        console.log(result);


      }
    }
  }
  compare(a, b) {
    return a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
  }
  createQueue(a, b, isCcw) {
    let list = [];
    if (isCcw) {
      list.push(a.pos);
      list.push(b.pos);
    }
    let index = b.index;
    for (var i = 0; i < this.length - 1; i++) {
      let next = this.next(index);
      let crnt = this.prev(next.index);
      if (next == a || next == b) {
        break;
      } else {
        if (!this.compare(crnt.pos, next.pos)) {
          list.push(next.pos);
        }
      }
      index++;
    }

    if (!isCcw) {
      list.push(a.pos);
      list.push(b.pos);
    }

    list.push(list[0]);
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
      return {
        point : point,
        distnace : vec3.distance(crntPoint.pos, point.pos)
      };
    });
    //let findIndex = 0;
    distnaces.sort((a, b) => {
      if (a.distnace < b.distnace) return -1;
      else if (a.distnace > b.distnace) return 1;
      else return 0;
    });
    return distnaces;

    // let minDistance = Math.min.apply(null, distnaces);
    // distnaces.find((distnace, distanceIndex) => {
    //   if (minDistance == distnace) {
    //     findIndex = distanceIndex;
    //     return true;
    //   }
    //   return false;
    // });
    // return filtedPoints[findIndex];
  }


  intersection(a1, a2, b1, b2) {
    let a = this.dot(this.cross(a1, a2, b1), this.cross(a1, a2, b2));
    let b = this.dot(this.cross(b1, b2, a1), this.cross(b1, b2, a2));
    if (a == 0 && b == 0) {

      //console.log(a1, a2, b1, b2);
      //console.log("A");
      return false;
    }

    //console.log("B");
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