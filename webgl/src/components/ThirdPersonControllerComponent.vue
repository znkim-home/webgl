<template>
  <div></div>
</template>
<script>
import Line from "@/assets/service/geometry/Line";
import Plane from "@/assets/service/geometry/Plane.js";

const { mat2, mat3, mat4, vec2, vec3, vec4 } = self.glMatrix; // eslint-disable-line no-unused-vars
export default {
  name: "FirstPerson",
  props: {
    webGl: Object,
    blocks: Object,
  },
  data() {
    return {
      controllerStatus : {
        moveStatus : false,
        movePlane : undefined,
        moveCameraPosition : undefined,
        rotateStatus : false,
        pivotPosition : undefined,
        zoomStatus : false,
        zoomCameraPosition : undefined,
        zoomCameraRay : undefined,
        ctrlStatus: false,
      },
      globalOptions : {
        BLOCK_SIZE : 16,
        MOVE_FACTOR : 15,
        ROTATE_FACTOR : 0.004,
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
        let depth = webGl.depthFbo.getDepth(mouseX, mouseY);

        if (depth > 5000) {
          return;
        }

        let offset = depth * 10 / -e.deltaY;
        let position = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, offset);
        console.log(depth, -e.deltaY, offset);
        camera.setPosition(position[0], position[1], position[2]);
      }
      canvas.onmousedown = (e) => {
        const webGl = this.webGl;
        const camera = webGl.camera;
        const blocks = this.blocks;
        const mouseX = e.x;
        const mouseY = canvas.height - e.y;
        let depth = webGl.depthFbo.getDepth(mouseX, mouseY);

        let ratioX = mouseX / canvas.width;
        let ratioY = mouseY / canvas.height;
        if (depth > 5000) {
          return;
        }
        const OFFSET = this.blocks.BLOCK_SIZE / 2;
        if (e.button == 2) {
          depth = webGl.depthFbo.getDepth(mouseX, mouseY) - 1;
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);

          if (this.controllerStatus.ctrlStatus) {
            let blockX = Math.floor(pos[0] / 128);
            let blockY = Math.floor(pos[1] / 128);
            let blockZ = Math.floor(Math.abs(pos[2] + 1) / 128);
            let originX = blockX * 128;
            let originY = blockY * 128;
            let originZ = blockZ * 128;
            let origin = vec3.fromValues(originX, originY, originZ / 2);

            let test = blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ];
            if (test === undefined || test != 0) {
              return;
            }
            let polygon = this.$parent.createDirt(origin);
            blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ] = polygon;
          } else {
            this.controllerStatus.zoomStatus = true;
            this.controllerStatus.zoomCameraPosition = camera.position;
            this.controllerStatus.zoomCameraRay = this.getRay(ratioX, ratioY, canvas.width, canvas.height);
          }
        } else if (e.button == 1) {
          depth = webGl.depthFbo.getDepth(mouseX, mouseY);
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);
          this.controllerStatus.pivotPosition = pos;
          this.controllerStatus.rotateStatus = true;
        } else if (e.button == 0) {

          let normal = webGl.normalFbo.getNormal(mouseX, mouseY);
          //depth = webGl.depthFbo.getDepth(mouseX, mouseY) + 5;
          depth = webGl.depthFbo.getDepth(mouseX, mouseY) + 5;
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);
          console.log(normal);

          let rm = camera.getRotationMatrix();
          let normalVec4 = vec4.fromValues(normal[0], normal[1], normal[2], 1.0);
          let rotatedNormal = vec4.transformMat4(vec4.create(), normalVec4, rm);
          //console.log(normal[0] );

          //let heading = Math.atan2(rotatedNormal[0], rotatedNormal[2]);
          //let pitch = -Math.asin(rotatedNormal[1]);

          let heading = Math.atan2(rotatedNormal[0], rotatedNormal[2]);
          let pitch = -Math.asin(rotatedNormal[1]);
          heading = Math.degree(heading);
          pitch = Math.degree(pitch);
          //console.log(heading, pitch);
          /*this.$parent.createPoint({
            position: { x: pos[0], y: pos[1], z: pos[2] },
            color: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
          });*/

          this.$parent.createCylinder({
            position: { x: pos[0], y: pos[1], z: pos[2] },
            rotation: { heading : 0.0, pitch : pitch, roll : heading},
            color: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
            radius : 50,
            height: 100,
          });

          //this.$parent.createDirt(pos);

          if (this.controllerStatus.ctrlStatus) {
            let blockX = Math.floor(pos[0] / 128);
            let blockY = Math.floor(pos[1] / 128);
            let blockZ = Math.floor(Math.abs(pos[2] + 1) / 128);
            let test = this.blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ];

            if (test === undefined) {
              return;
            } else if (test != 0) {
              this.$parent.removeObj(test);
              blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ] = 0;
              return;
            }
          }
          else {
            this.controllerStatus.moveStatus = true;
            this.controllerStatus.movePlane = new Plane(pos, vec3.fromValues(0, 0, 1));
            this.controllerStatus.moveCameraPosition = camera.position;
          }
        }
      };
      canvas.onmousemove = (e) => {
        const webGl = this.webGl;
        const camera = webGl.camera;
        const xValue = e.movementX * this.globalOptions.ROTATE_FACTOR;
        const yValue = e.movementY * this.globalOptions.ROTATE_FACTOR;
        const mouseX = e.x;
        const mouseY = canvas.height - e.y;
        const ratioX = mouseX / canvas.width;
        const ratioY = mouseY / canvas.height;

        if (this.controllerStatus.moveStatus) {
          let ray = this.getRay(ratioX, ratioY, canvas.width, canvas.height);
          let line = new Line(camera.position, ray);
          let movedPosition = this.controllerStatus.movePlane.getIntersection(line);
          camera.moveCamera(this.controllerStatus.moveCameraPosition, this.controllerStatus.movePlane.position, movedPosition);
        } else if (this.controllerStatus.rotateStatus) {
          camera.rotationOrbit(-xValue, -yValue, this.controllerStatus.pivotPosition);
        } else if (this.controllerStatus.zoomStatus) {
          let ray = this.controllerStatus.zoomCameraRay;
          let scaledRay = vec3.scale(vec3.create(), ray, yValue * 2000);
          let position = vec3.add(vec3.create(), camera.position, scaledRay);
          camera.setPosition(position[0], position[1], position[2]);
        }
      };
      canvas.onmouseup = (e) => {
        if (e.button == 0) {
          this.controllerStatus.moveStatus = false;
          this.controllerStatus.movePlane = undefined;
          this.controllerStatus.moveCameraPosition = undefined;
        } else if (e.button == 1) {
          this.controllerStatus.rotateStatus = false;
          this.controllerStatus.pivotPosition = undefined;
        } else if (e.button == 2) {
          this.controllerStatus.zoomStatus = false;
          this.controllerStatus.zoomCameraPosition = undefined;
        }
      }
    },
    initKey() {
      window.onkeydown = (e) => {
        this.controllerStatus.ctrlStatus = e.ctrlKey;
      };
      window.onkeyup = (e) => {
        this.controllerStatus.ctrlStatus = e.ctrlKey;
      };
    },
    getRay(x, y, width, height) {
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
    },
    getScreenPosition(x, y, width, height, depth) {
      const webGl = this.webGl;
      const camera = webGl.camera;
      let ray3 = this.getRay(x, y, width, height, depth);
      vec3.scale(ray3, ray3, depth);
      vec3.add(ray3, camera.position, ray3);
      return ray3;
    }
  },
};
</script>
<style scoped>
</style>