import Buffer from './Buffer.js';
import Renderable from './abstract/Renderable';
import Triangle from './geometry/Triangle.js';
import Point, {PointQueue} from './geometry/Point.js';
const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Polygon extends Renderable {
  height;
  constructor(polygonPoints, options) {
    super();
    this.init(polygonPoints, options);
  }
  
  init(polygonPoints, options) {
    this.height = 5.0 //height
    if (options?.height) {
      this.height = options.height
    }
    if (options?.position) {
      this.pos = vec3.set(this.pos, options.position.x, options.position.y, options.position.z);
    }
    if (options?.rotation) {
      this.rot = vec3.set(this.rot, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    }
    if (options?.color) {
      this.color = vec4.set(this.color, options?.color.r,options?.color.g, options?.color.b, options?.color.a);
    }
  }
  // overriding
  render(gl, shaderInfo) {
    let tm = this.getTransformMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);

    let buffer = this.getBuffer(gl, shaderInfo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);

    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);

    buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);

    gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);//
  }

  createTriangle(a, b, c) {
    return new Triangle(a, b, c);
  }

  createSideTriangle(bottomPoints, topPoints) {
    let result = [];
    for (var i = 1 ; i < bottomPoints.length; i++) {
      let botA = bottomPoints[i - 1];
      let botB = bottomPoints[i];
      let topA = topPoints[i - 1];
      let topB = topPoints[i];
      result.push(new Triangle(topB, topA, botA));
      result.push(new Triangle(topB, botA, botB));

      //result.push(new Triangle(topB, botA, topA));
      //result.push(new Triangle(topB, botB, botA));
    }
    return result;
  }
  
  validateAngle(points) {
    let angleSum = 0;
    let reverseAngleSum = 0;
    points.forEach((point) => {
      var angle = Math.degree(point.angle);
      //console.log(point.normal == 0);
      if (point.normal > 0) {
        angleSum += angle;
      } else {
        reverseAngleSum += angle;
      }
    });
    //console.log(`${angleSum} :: ${reverseAngleSum}`);
    return angleSum > reverseAngleSum;
    //return true;
  }

  /*validateIntersection(points, a, b) {


    this.intersection();
  }*/


  isConvex(points) {
    let cw = points.find((point) => point.normal < 0);
    return cw === undefined;
  }

  validateConvex(points, convexs = []) {
    let pointQueue = new PointQueue(points);
    if (this.isConvex(points)) {
      //convexs = convexs.concat(pointQueue.points);
      convexs.push(pointQueue.points);
      //return convexs;
    } else {
      let cwPoint = points.find((point) => point.normal < 0);
      //let nearPoint = pointQueue.near(cwPoint.index);

      //console.log(nearPoint);

      //let divided = pointQueue.divide(cwPoint, nearPoint);
      let nearPoints = pointQueue.near(cwPoint.index);
      nearPoints.some((nearPoint) => {
        let divided = pointQueue.divide(cwPoint, nearPoint.point);

        let aPolygon = this.validateAngle(divided[0].points);
        let bPolygon = this.validateAngle(divided[1].points);

        if (aPolygon ^ bPolygon == 0) {
          this.validateConvex(divided[0].points, convexs);
          this.validateConvex(divided[1].points, convexs);
          return true;
        }
      })

      //let aPolygon = this.validateAngle(divided[0].points);
      //let bPolygon = this.validateAngle(divided[1].points);

      //if (aPolygon && bPolygon) {
      //  this.validateConvex(divided[0].points, convexs);
      //  this.validateConvex(divided[1].points, convexs);
      //}

      //this.validateConvex(divided[0].points, convexs);
      //this.validateConvex(divided[1].points, convexs);
    }
    return convexs;
  }

  /*isConvex(points) {
    pointQueue.
  }*/

  // 볼록이를 삼각형들로
  convertToConvex(points) {
    var result = [];
    for (let i = 1; i < (points.length - 1); i++) {
      let triangle = this.createTriangle(points[0], points[i], points[i + 1]);
      result.push(triangle);
    }
    return result;
  }

  convertToConvexReverse(points) {
    var result = [];
    for (let i = 1; i < (points.length - 1); i++) {
      let triangle = this.createTriangle(points[0], points[i + 1], points[i]);
      result.push(triangle);
    }
    return result;
  }

  // overriding
  getBuffer(gl) {
    if (this.buffer === undefined) {
      console.log("ready");
      let color = this.color;
      let colors = [];
      let positions = [];
      let normals = [];
      this.buffer = new Buffer(gl);

      //let coordinates = [[2.0, 0.0], [4.0, 0.0], [6.0, 3.0], [4.0, 6.0], [0.0, 3.0], [2.0, 0.0]];
      //let coordinates = [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], [0.0, 0.0]];  //rectangle
      //let coordinates = [[0.0, 0.0], [3.0, 0.0], [3.0, 3.0], [2.0, 3.0], [2.0, 2.0], [1.0, 2.0], [1.0, 3.0], [0.0, 3.0], [0.0, 0.0]];  //오목이
      //let coordinates = [[1,2], [2,1], [3,0], [4,1], [5,1], [7,2], [7,4], [5,4], [5,2], [4,3], [3,3], [2,2], [3,4], [1,4], [1,2]];
      
      let coordinates = [[0, 0],
      [ -21.951406721184544,1.411658575409092],
      [ -18.931819965504577, -31.62057215112145],
      [ -59.61723169677022, -15.306965240568388],
      [ -56.59405650303388, -54.5800738594553],
      [ -19.133239075196457, -48.53889695657563],
      [ -23.76531379508372, -84.3892918180718],
      [ 18.73189854446248, -80.96566535798047],
      [ 2.61950893750002, -52.76805816630076],
      [ 41.29093343922073, -54.58027088116796],
      [ 35.6503068906377, -18.327550101821544],
      [ 3.4255374908510503, -25.37620030296239],
      [0, 0]];


      let topPoints = coordinates.map((coordinate) => {
        return new Point(coordinate[0], coordinate[1], this.height);
      });
      let bottomPoints = coordinates.map((coordinate) => {
        return new Point(coordinate[0], coordinate[1], 0);
      });

      let TopConvexPolygons = this.validateConvex(topPoints);
      let BotConvexPolygons = this.validateConvex(bottomPoints);

      let sideTriangles = this.createSideTriangle(bottomPoints, topPoints);

      let topTriangles;
      let bottomTriangles;

      if (TopConvexPolygons) {
        topTriangles = [];
        bottomTriangles = [];

        TopConvexPolygons.forEach((ConvexPolygon) => {
          let triangles = this.convertToConvex(ConvexPolygon);
          topTriangles = topTriangles.concat(triangles);
        })

        BotConvexPolygons.forEach((ConvexPolygon) => {
          let triangles = this.convertToConvexReverse(ConvexPolygon);
          bottomTriangles = bottomTriangles.concat(triangles);
        })

        //topTriangles = this.convertToConvex(divided);
        //bottomTriangles = this.convertToConvex(bottomPoints.reverse());
      }
      /*if (!divided[0]) {
        topTriangles = this.convertToConvex(topPoints);
        bottomTriangles = this.convertToConvex(bottomPoints.reverse());
      } else {
        topTriangles = this.convertToConvex(divided[0].points.concat(divided[1].points));
        bottomTriangles = this.convertToConvex(bottomPoints.reverse());
      }*/

      // FIXED
      let triangles = bottomTriangles.concat(topTriangles).concat(sideTriangles);
      triangles.forEach((triangle) => { // triangle
        let trianglePositions = triangle.points; // [vec3, vec3, vec3]
        let normal = triangle.normal;

        let r = Math.round(Math.random()*10)/10;
        let g = Math.round(Math.random()*10)/10;
        let b = Math.round(Math.random()*10)/10;
        color = vec4.fromValues(r, g, b, 1.0);
        //color = vec4.fromValues(1.0, 1.0, 0.0, 1.0);

        trianglePositions.forEach((position) => { // vec3
          position.pos.forEach((value) => { // x, y, z
            positions.push(value);
          });
          normal.forEach((value) => {
            normals.push(value);
          });
          color.forEach((value) => {
            colors.push(value);
          });
        });
      });

      let indices = new Uint16Array(positions.length);
      this.buffer.indicesVBO = indices.map((obj, index) => {
        return index;
      });

      this.buffer.positionsVBO = new Float32Array(positions);
      this.buffer.normalVBO = new Float32Array(normals);
      this.buffer.colorVBO = new Float32Array(colors);

      this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO); 
      this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO); 
      this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO); 
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);

      this.buffer.indicesLength = this.buffer.indicesVBO.length;
    }
    return this.buffer;
  }
}