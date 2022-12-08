<template>
  <div></div>
</template>
<script>
import Line from  "@/assets/service/geometry/Line.js";
import Triangle from  "@/assets/service/geometry/Triangle.js";

export default {
  name: "FirstPerson",
  props: {
    webGl: Object,
  },
  data() {
    return {
      MOVE_FACTOR : 5,
      mouseStatus: false,
      shiftStatus: false,
      keyStatus: {},
      mousePos: {},
      test : undefined,
      pointPositions : [],
      line : undefined,
      globalOption : {
        cameraZAxis : true
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.initKey();
      this.initMouse();
      this.test = new Triangle([-500, -500, 0], [500, -500, 0], [500, 500, 0]);

      let image = new Image();
      image.onload = () => {
        this.image = image;
      }
      image.src = "/image/duck_256.jpg";
    },
    initMouse() {
      let canvas = document.getElementById("glcanvas");
      canvas.ondblclick = (e) => {
        if (e.button == 0) {
          this.pointPositions.pop();
          let coordinates = this.pointPositions.map((pointPosition) => {
            return [pointPosition[0], pointPosition[1]];
          }); 

          this.$parent.createPolygon(coordinates, {
            position: { x: 0, y: 0, z: 0 },
            color: { r: 0.0, g: 0.5, b: 1.0, a: 0.5 },
            height: 100,
            image : this.image
          });

          this.line = undefined;
          this.pointPositions = [];
        }
      }
      canvas.onmousewheel = (e) => {
        if (e.deltaY != 0) {
          const webGl = this.webGl;
          const camera = webGl.camera;
          const ROTATE_FACTOR = 0.1;
          let yValue = e.deltaY * ROTATE_FACTOR;
          let degree = camera.fovyDegree + yValue;
          if (degree > 0 && degree < 180) {
            camera.fovyDegree = degree;
          }
        }
      };
      canvas.onmousedown = (e) => {
        if (e.button == 2) {
          if (this.mouseStatus) {
            this.mouseStatus = false;
            document.exitPointerLock();
          } else {
            this.mouseStatus = true;
            canvas.requestPointerLock();
          }
        } else if (e.button == 0) {
          const vec4 = self.glMatrix.vec4;
          const vec3 = self.glMatrix.vec3;
          const webGl = this.webGl;
          const camera = webGl.camera;

          let ratioX = e.x / canvas.width;
          let ratioY = (canvas.height - e.y) / canvas.height;
          
          let ray = camera.getViewRay({
            x : ratioX,
            y : ratioY,
            width : canvas.width,
            height : canvas.height,
          }, 1);

          let rotationMatrix = camera.getRotationMatrix();
          let ray4 = vec4.transformMat4(vec4.create(), vec4.fromValues(ray[0], ray[1], ray[2], 1), rotationMatrix);
          let ray3 = vec3.fromValues(ray4[0], ray4[1], ray4[2]);
          vec3.normalize(ray3, ray3);
          let line = new Line(camera.position, ray3);
          
          let plane = this.test.getPlane();
          let result = plane.getIntersection(line);
          
          this.$parent.createPoint({
            position: { x: result[0], y: result[1], z: result[2] },
            size: { width: 30, length: 30, height: 30 },
            color: {r: 1.0, g: 0.3, b: 0.3, a: 1.0 },
          });

          this.pointPositions.push(result);
          let coordinates = this.pointPositions;
          if (this.pointPositions.length >= 2 ) {
            if (!this.line) {
              this.line = this.$parent.createLine(coordinates, {
                color: {r: 1.0, g: 0.3, b: 0.3, a: 1.0 },
              });
            } else {
              this.line.coordinates = coordinates;
            }
          }
        }
      };
      canvas.onmousemove = (e) => {
        if (this.mouseStatus) {
          const webGl = this.webGl;
          const camera = webGl.camera;
          const ROTATE_FACTOR = 0.1;
          let xValue = e.movementX * ROTATE_FACTOR;
          let yValue = e.movementY * ROTATE_FACTOR;

          if (xValue != 0) {
            if (this.globalOption.cameraZAxis) {
              camera.rotate(-xValue, 0, 0);
            } else {
              camera.rotate(0, 0, xValue);
            }
          }

          if (yValue != 0) {
            camera.rotate(0, -yValue, 0);
          }
        }
      };
      canvas.onmouseup = () => {};
    },
    initKey() {
      const moveMs = 8; // 66:15fps 33:30fps , 16:60fps
      setInterval(() => {
        let MOVE_FACTOR = this.MOVE_FACTOR;
        const webGl = this.webGl;
        const camera = webGl.camera;

        let keyStatus = this.keyStatus;
        if (keyStatus.w === true) {
          camera.moveForward(-MOVE_FACTOR);
          keyStatus.s = false;
        } else if (keyStatus.s === true) {
          camera.moveForward(MOVE_FACTOR);
          keyStatus.w = false;
        }

        if (keyStatus.a === true) {
          camera.moveRight(-MOVE_FACTOR);
          keyStatus.d = false;
        } else if (keyStatus.d === true) {
          camera.moveRight(MOVE_FACTOR);
          keyStatus.a = false;
        }

        if (keyStatus.q === true) {
          camera.moveUp(MOVE_FACTOR);
          keyStatus.e = false;
        } else if (keyStatus.e === true) {
          camera.moveUp(-MOVE_FACTOR);
          keyStatus.q = false;
        }
      }, moveMs);
      window.onkeydown = (e) => {
        this.keyStatus[e.key] = true;
        if (e.ctrlKey) {
          e.preventDefault();
        }
        if (e.shiftKey) {
          if (this.shiftStatus) {
            this.MOVE_FACTOR = 5;
          } else {
            this.MOVE_FACTOR = 15;
          }
          this.shiftStatus = !this.shiftStatus;
          e.preventDefault();
        }
      };
      window.onkeyup = (e) => {
        this.keyStatus[e.key] = false;
        if (e.key == "Escape") {
          this.mouseStatus = false;
        }
      };
    },
  },
};
</script>

<style scoped>
</style>