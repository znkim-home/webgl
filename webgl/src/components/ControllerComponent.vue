<template>
  <div></div>
</template>
<script>
import Line from "@/assets/service/geometry/Line";
import Plane from "@/assets/service/geometry/Plane.js";

export default {
  name: "FirstPerson",
  props: {
    webGl: Object,
  },
  data() {
    return {
      MOVE_FACTOR : 15,

      moveStatus : false,
      movePlane : undefined,
      moveCameraPosition : undefined,

      rotateStatus : false,
      pivotPosition : undefined,

      zoomStatus : false,
      zoomCameraPosition : undefined,
      zoomCameraRay : undefined,

      mouseStatus: false,
      shiftStatus: false,
      ctrlStatus: false,
      keyStatus: {},
      mousePos: {},
      test : undefined,
      pointPositions : [],
      line : undefined,
      globalOption : {
        cameraZAxis : false
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
      this.initImage();

      this.blocks = {}
      const MAXVALUE = 8;
      let xpos = [];
      for (let x = 0; x < MAXVALUE; x++) {
        let ypos = [];
        for (let y = 0; y < MAXVALUE; y++) {
          let zpos = [];
          for (let z = 0; z < MAXVALUE; z++) {
            zpos[z] = 0;
          }
          ypos.push(zpos);
        }
        xpos.push(ypos);
      }
      this.blocks.pos = xpos;
    },
    initImage() {
      let image = new Image();
      image.crossOrigin = "";
      image.onload = () => {
        this.image = image;
      }
      image.src = "/image/dirt_512.jpg";
      //image.src = "/image/duck_256.jpg";
    },
    initMouse() {
      let canvas = document.getElementById("glcanvas");
      canvas.onwheel = (e) => {
        const webGl = this.webGl;
        const camera = webGl.camera;

        const mouseX = e.x;
        const mouseY = canvas.height - e.y;
        const ratioX = mouseX / canvas.width;
        const ratioY = mouseY / canvas.height;

        let position = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, -e.deltaY);
        camera.setPosition(position[0], position[1], position[2]);
        console.log(position);
      }

      canvas.onmousedown = (e) => {
        const vec3 = self.glMatrix.vec3;
        const webGl = this.webGl;
        const camera = webGl.camera;
        const mouseX = e.x;
        const mouseY = canvas.height - e.y;

        //let selectionId = webGl.selectionFbo.getColor(mouseX, mouseY);
        let depth = webGl.depthFbo.getDepth(mouseX, mouseY);
        let normal = webGl.normalFbo.getNormal(mouseX, mouseY);

        let ratioX = mouseX / canvas.width;
        let ratioY = mouseY / canvas.height;

        if (depth > 5000) {
          return;
        }

        if (e.button == 2) {
          depth = webGl.depthFbo.getDepth(mouseX, mouseY) - 1;
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);

          if (this.ctrlStatus) {
            let blockX = Math.floor(pos[0] / 128);
            let blockY = Math.floor(pos[1] / 128);
            let blockZ = Math.floor(Math.abs(pos[2] + 1) / 128);
            let originX = blockX * 128;
            let originY = blockY * 128;
            let originZ = blockZ * 128;
            let origin = vec3.fromValues(originX, originY, originZ / 2);

            let test = this.blocks.pos[blockX + 4][blockY + 4][blockZ];
            if (test === undefined || test != 0) {
              return;
            }
            let coordinates = [[-64, -64], [64, -64], [64, 64], [-64, 64]];
            let polygon = this.$parent.createPolygon(coordinates, {
              position: { x: origin[0] + 64, y: origin[1] + 64, z: origin[2]},
              color: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
              height: 128,
              image : this.image
            });
            this.blocks.pos[blockX + 4][blockY + 4][blockZ] = polygon;
          } else {
            this.zoomStatus = true;
            this.zoomCameraPosition = camera.position;
            this.zoomCameraRay = this.getRay(ratioX, ratioY, canvas.width, canvas.height);
          }
        } else if (e.button == 1) {
          console.log();
          depth = webGl.depthFbo.getDepth(mouseX, mouseY);
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);

          this.pivotPosition = pos;
          this.rotateStatus = true;
          this.$parent.createPoint({
            position: { x: pos[0], y: pos[1], z: pos[2]},
            size: { width: 30, length: 30, height: 30 },
            color: {r: 0.8, g: 0.5, b: 0.8, a: 1.0 },
          });
        } else if (e.button == 0) {
          depth = webGl.depthFbo.getDepth(mouseX, mouseY) + 5;
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);

          if (this.ctrlStatus) {
            let blockX = Math.floor(pos[0] / 128);
            let blockY = Math.floor(pos[1] / 128);
            let blockZ = Math.floor(Math.abs(pos[2] + 1) / 128);
            let test = this.blocks.pos[blockX + 4][blockY + 4][blockZ];
            if (test === undefined) {
              return;
            } else if (test != 0) {
              this.$parent.removeObj(test);
              this.blocks.pos[blockX + 4][blockY + 4][blockZ] = 0;
              return;
            }
          }
          else {
            this.moveStatus = true;
            this.movePlane = new Plane(pos, normal);
            this.moveCameraPosition = camera.position;
          }
        }
      };

      canvas.onmousemove = (e) => {
        const webGl = this.webGl;
        const camera = webGl.camera;
        const vec3 = self.glMatrix.vec3;

        const ROTATE_FACTOR = 0.004;
        const xValue = e.movementX * ROTATE_FACTOR;
        const yValue = e.movementY * ROTATE_FACTOR;
        const mouseX = e.x;
        const mouseY = canvas.height - e.y;
        const ratioX = mouseX / canvas.width;
        const ratioY = mouseY / canvas.height;

        if (this.moveStatus) {
          let ray = this.getRay(ratioX, ratioY, canvas.width, canvas.height);
          let line = new Line(camera.position, ray);
          let movedPosition = this.movePlane.getIntersection(line);
          camera.moveCamera(this.moveCameraPosition, this.movePlane.position, movedPosition);
          //this.movePlane = new Plane(movedPosition, this.movePlane.normal);
        } else if (this.rotateStatus) {
          camera.rotationOrbit(-xValue, -yValue, this.pivotPosition);
        } else if (this.zoomStatus) {
          let ray = this.zoomCameraRay;
          let scaledRay = vec3.scale(vec3.create(), ray, yValue * 2000);
          let position = vec3.add(vec3.create(), camera.position, scaledRay);
          camera.setPosition(position[0], position[1], position[2]);
        }
      };

      canvas.onmouseup = (e) => {
        if (e.button == 0) {
          this.moveStatus = false;
          this.movePlane = undefined;
          this.moveCameraPosition = undefined;
        } else if (e.button == 1) {
          this.rotateStatus = false;
          this.pivotPosition = undefined;
        } else if (e.button == 2) {
          this.zoomStatus = false;
          this.zoomCameraPosition = undefined;
        }
      }
    },
    initKey() {
      // 66:15fps 
      // 33:30fps
      // 16:60fps
      const moveMs = 16; 
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
        this.ctrlStatus = e.ctrlKey;
        this.keyStatus[e.key] = true;
        if (e.ctrlKey) {
          e.preventDefault();
        }
        if (e.shiftKey) {
          if (this.shiftStatus) {
            this.MOVE_FACTOR = 30;
          } else {
            this.MOVE_FACTOR = 15;
          }
          this.shiftStatus = !this.shiftStatus;
          e.preventDefault();
        }
      };

      window.onkeyup = (e) => {
        this.ctrlStatus = e.ctrlKey;
        this.keyStatus[e.key] = false;
        if (e.key == "Escape") {
          this.mouseStatus = false;
        }
      };
    },
    getScreenPosition(x, y, width, height, depth) {
      const vec3 = self.glMatrix.vec3;
      const webGl = this.webGl;
      const camera = webGl.camera;
      let ray3 = this.getRay(x, y, width, height, depth);
      vec3.scale(ray3, ray3, depth);
      vec3.add(ray3, camera.position, ray3);
      return ray3;
    },
    getRay(x, y, width, height) {
      const vec4 = self.glMatrix.vec4;
      const vec3 = self.glMatrix.vec3;
      const webGl = this.webGl;
      const camera = webGl.camera;
      let ray = camera.getViewRay({
        x : x,
        y : y,
        width : width,
        height : height,
      }, 1);
      let rotationMatrix = camera.getRotationMatrix();
      let ray4 = vec4.transformMat4(vec4.create(), vec4.fromValues(ray[0], ray[1], ray[2], 1), rotationMatrix);
      return vec3.fromValues(ray4[0], ray4[1], ray4[2]);
    }
  },
};
</script>
<style scoped>
</style>