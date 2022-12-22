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
      BLOCK_SIZE : 16,
      MOVE_FACTOR : 15,

      moveStatus : false,
      movePlane : undefined,
      moveCameraPosition : undefined,

      rotateStatus : false,
      pivotPosition : undefined,

      zoomStatus : false,
      zoomCameraPosition : undefined,
      zoomCameraRay : undefined,

      ctrlStatus: false,
      
      mousePos: {},
      globalOption : {
        cameraZAxis : false
      }
    };
  },
  mounted() {
    this.init();
    setTimeout(() => {
      this.initGround();
    },100);
  },
  methods: {
    init() {
      this.initKey();
      this.initMouse();
      this.blocks = {}
      const MAXVALUE = this.BLOCK_SIZE;
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
    initGround() {
      const OFFSET = this.BLOCK_SIZE / 2;
      const MAXVALUE = this.BLOCK_SIZE;
      for (let x = 0; x < MAXVALUE; x++) {
        for (let y = 0; y < MAXVALUE; y++) {
          for (let z = 0; z < MAXVALUE; z++) {
            if (z == 0) {
              let originX = (x - OFFSET) * 128;
              let originY = (y - OFFSET) * 128;
              let originZ = z * 128;
              let polygon = this.$parent.createDirt([originX, originY, originZ / 2]);
              this.blocks.pos[x][y][z] = polygon;
            }
          }
        }
      }

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
        //let normal = webGl.normalFbo.getNormal(mouseX, mouseY);

        let ratioX = mouseX / canvas.width;
        let ratioY = mouseY / canvas.height;

        if (depth > 5000) {
          return;
        }

        const OFFSET = this.BLOCK_SIZE / 2;
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

            let test = this.blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ];
            if (test === undefined || test != 0) {
              return;
            }

            let polygon = this.$parent.createDirt(origin);
            this.blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ] = polygon;
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
        } else if (e.button == 0) {
          depth = webGl.depthFbo.getDepth(mouseX, mouseY) + 5;
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);
          if (this.ctrlStatus) {
            let blockX = Math.floor(pos[0] / 128);
            let blockY = Math.floor(pos[1] / 128);
            let blockZ = Math.floor(Math.abs(pos[2] + 1) / 128);
            let test = this.blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ];
            if (test === undefined) {
              return;
            } else if (test != 0) {
              this.$parent.removeObj(test);
              this.blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ] = 0;
              return;
            }
          }
          else {
            this.moveStatus = true;
            this.movePlane = new Plane(pos, vec3.fromValues(0, 0, 1));
            //this.movePlane = new Plane(pos, normal);
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
      window.onkeydown = (e) => {
        this.ctrlStatus = e.ctrlKey;
      };
      window.onkeyup = (e) => {
        this.ctrlStatus = e.ctrlKey;
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