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
        moveObject : false,
        moveObjectOffset : undefined,
        movePlane : undefined,
        moveCameraPosition : undefined,
        rotateStatus : false,
        rotateObject : false,
        pivotPosition : undefined,
        zoomStatus : false,
        zoomCameraPosition : undefined,
        zoomCameraRay : undefined,
        altStatus: false,
        ctrlStatus: false,
        shiftStatus: false,
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
      canvas.ontouchstart = (e) => {
        const webGl = this.webGl;
        const camera = webGl.camera;
        const target = e.targetTouches[0];
        this.touchStartPosition = [target.clientX, target.clientY];
        console.log(e.changedTouches);

        const mouseX = target.clientX;
        const mouseY = canvas.height -target.clientY;
        const ratioX = mouseX / canvas.width;
        const ratioY = mouseY / canvas.height;

        let depth = webGl.depthFbo.getDepth(mouseX, mouseY);
        let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);
        if (e.targetTouches.length == 2) {
          this.controllerStatus.zoomStatus = true;
          this.controllerStatus.zoomCameraPosition = camera.position;
          this.controllerStatus.zoomCameraRay = this.getRay(ratioX, ratioY, canvas.width, canvas.height);
        } else if (e.targetTouches.length == 1) {
          this.controllerStatus.moveStatus = true;
          this.controllerStatus.movePlane = new Plane(pos, vec3.fromValues(0, 0, 1));
          this.controllerStatus.moveCameraPosition = camera.position;
        }
        e.preventDefault();
      }
      canvas.ontouchmove = (e) => {
        const webGl = this.webGl;
        const camera = webGl.camera;
        const target = e.targetTouches[0];
        const startPosition = this.touchStartPosition;
        let touchMovedPosition = [startPosition[0] - target.clientX, startPosition[1] - target.clientY];
        const mouseX = target.clientX;
        const mouseY = canvas.height -target.clientY;
        const ratioX = mouseX / canvas.width;
        const ratioY = mouseY / canvas.height;
        //const xValue = touchMovedPosition[0] * this.globalOptions.ROTATE_FACTOR;
        const yValue = touchMovedPosition[1] * this.globalOptions.ROTATE_FACTOR;

        if (this.controllerStatus.moveStatus) {
          let ray = this.getRay(ratioX, ratioY, canvas.width, canvas.height);
          let line = new Line(camera.position, ray);
          let movedPosition = this.controllerStatus.movePlane.getIntersection(line);
          if (this.controllerStatus.moveObject) {
            let objectOffset = this.controllerStatus.moveObjectOffset;
            let selectedObject = this.$parent.getSelectedObject();
            selectedObject.position[0] = movedPosition[0] - objectOffset[0];
            selectedObject.position[1] = movedPosition[1] - objectOffset[1];
            selectedObject.dirty = true;
          } else {
            camera.moveCamera(this.controllerStatus.moveCameraPosition, this.controllerStatus.movePlane.position, movedPosition);
          }
        } else if (this.controllerStatus.zoomStatus) {
          let depth = webGl.depthFbo.getDepth(mouseX, mouseY);
          let ray = this.controllerStatus.zoomCameraRay;
          let scaledRay = vec3.scale(vec3.create(), ray, yValue * depth);
          let position = vec3.add(vec3.create(), camera.position, scaledRay);
          camera.setPosition(position[0], position[1], position[2]);
        }
        e.preventDefault();
      }
      canvas.ontouchend = (e) => {
        console.log("touch end", e);
        this.controllerStatus.moveObject = false;
        this.controllerStatus.moveObjectOffset = undefined;
        this.controllerStatus.moveStatus = false;
        this.controllerStatus.movePlane = undefined;
        this.controllerStatus.moveCameraPosition = undefined;
        this.controllerStatus.rotateStatus = false;
        this.controllerStatus.pivotPosition = undefined;
        this.controllerStatus.rotateObject = false;
        this.controllerStatus.zoomStatus = false;
        this.controllerStatus.zoomCameraPosition = undefined;
        e.preventDefault();
      }

      canvas.onwheel = (e) => {
        const webGl = this.webGl;
        const camera = webGl.camera;
        const mouseX = e.x;
        const mouseY = canvas.height - e.y;
        const ratioX = mouseX / canvas.width;
        const ratioY = mouseY / canvas.height;
        let depth = webGl.depthFbo.getDepth(mouseX, mouseY);
        let selectionColor = webGl.selectionFbo.getColor(mouseX, mouseY);
        if (selectionColor == 4294967295) {
          return;
        }

        let offset = depth * 20 / -e.deltaY;
        let position = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, offset);
        camera.setPosition(position[0], position[1], position[2]);
      }
      canvas.ondblclick = (e) => {
        const webGl = this.webGl;
        const camera = webGl.camera;
        const mouseX = e.x;
        const mouseY = canvas.height - e.y;
        let ratioX = mouseX / canvas.width;
        let ratioY = mouseY / canvas.height;
        
        let selectionColor = webGl.selectionFbo.getColor(mouseX, mouseY);
        if (selectionColor == 4294967295) {
          return;
        }

        if (e.button == 0) {

          if (this.controllerStatus.ctrlStatus) {
            let normal = webGl.normalFbo.getNormal(mouseX, mouseY);
            let depth = webGl.depthFbo.getDepth(mouseX, mouseY);
            let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);

            let rm = camera.getRotationMatrix();
            let normalVec4 = vec4.fromValues(normal[0], normal[1], normal[2], 1.0);
            let rotatedNormal = vec4.transformMat4(vec4.create(), normalVec4, rm);
            let heading = Math.atan2(rotatedNormal[0], rotatedNormal[2]);
            let pitch = -Math.asin(rotatedNormal[1]);
            heading = Math.degree(heading);
            pitch = Math.degree(pitch);
            
            this.$parent.createObject({
              position: { x: pos[0], y: pos[1], z: pos[2]},
              rotation: { heading : 0.0, pitch : pitch, roll : heading},
            });
          } else {
            let selectedObject = this.$parent.getSelectedObject();
            if (selectedObject) {
              if (selectedObject.id == selectionColor) {
                this.$parent.diselectObj();
              } else {
                this.$parent.selectObj(selectionColor);
              }
            } else {
              this.$parent.selectObj(selectionColor);
            }
          }
        }
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
        let selectionColor = webGl.selectionFbo.getColor(mouseX, mouseY);
        if (selectionColor == 4294967295) {
          return;
        }
        
        const OFFSET = this.blocks.BLOCK_SIZE / 2;
        if (e.button == 2) {
          depth = webGl.depthFbo.getDepth(mouseX, mouseY) - 1;
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);

          if (this.controllerStatus.altStatus) {
            //this.$parent.diselectObj();
            console.log("empty");
          } else if (this.controllerStatus.shiftStatus) {
            let blockX = Math.floor(pos[0] / 128);
            let blockY = Math.floor(pos[1] / 128);
            let blockZ = Math.floor(pos[2] / 128);
            let originX = blockX * 128;
            let originY = blockY * 128;
            let originZ = blockZ * 128;
            let origin = vec3.fromValues(originX, originY, originZ);

            let test = blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ];
            if (test === undefined || test != 0) {
              return;
            }
            let polygon = this.$parent.createDirt(origin);
            blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ] = polygon;
          } else if (this.controllerStatus.ctrlStatus) {
            console.log("rotate2");
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
          depth = webGl.depthFbo.getDepth(mouseX, mouseY) + 5;
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);
          
          if (this.controllerStatus.altStatus) {
            let selectedObject = this.$parent.getSelectedObject();
            if (selectedObject) {
              this.controllerStatus.moveObject = true;
              this.controllerStatus.moveObjectOffset = vec3.sub(vec3.create(), pos, selectedObject.position);
              this.controllerStatus.moveStatus = true;
              this.controllerStatus.movePlane = new Plane(pos, vec3.fromValues(0, 0, 1));
              this.controllerStatus.moveCameraPosition = camera.position;
            }
          } else if (this.controllerStatus.shiftStatus) {
            let blockX = Math.floor(pos[0] / 128);
            let blockY = Math.floor(pos[1] / 128);
            let blockZ = Math.floor(pos[2] / 128);
            let test = this.blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ];
            if (test === undefined) {
              return;
            } else if (test != 0) {
              this.$parent.removeObj(test);
              blocks.pos[blockX + OFFSET][blockY + OFFSET][blockZ] = 0;
              return;
            }
          } else if (this.controllerStatus.ctrlStatus) {
            console.log("rotate1");
            if (this.$parent.getSelectedObject()) {
              depth = webGl.depthFbo.getDepth(mouseX, mouseY);
              let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);
              this.controllerStatus.pivotPosition = pos;
              this.controllerStatus.rotateStatus = true;
              this.controllerStatus.rotateObject = true;
            }
          } else {
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
          if (this.controllerStatus.moveObject) {
            let objectOffset = this.controllerStatus.moveObjectOffset;
            let selectedObject = this.$parent.getSelectedObject();
            selectedObject.position[0] = movedPosition[0] - objectOffset[0];
            selectedObject.position[1] = movedPosition[1] - objectOffset[1];
            selectedObject.dirty = true;
          } else {
            camera.moveCamera(this.controllerStatus.moveCameraPosition, this.controllerStatus.movePlane.position, movedPosition);
          }
        } else if (this.controllerStatus.rotateStatus) {
          if (this.controllerStatus.rotateObject) {
            this.$parent.getSelectedObject().rotation[2] += Math.degree(xValue - yValue);
            this.$parent.getSelectedObject().dirty = true;
          } else {
            camera.rotationOrbit(-xValue, -yValue, this.controllerStatus.pivotPosition);
          }
        } else if (this.controllerStatus.zoomStatus) {
          let depth = webGl.depthFbo.getDepth(mouseX, mouseY);
          let ray = this.controllerStatus.zoomCameraRay;
          let scaledRay = vec3.scale(vec3.create(), ray, yValue * depth);
          let position = vec3.add(vec3.create(), camera.position, scaledRay);
          camera.setPosition(position[0], position[1], position[2]);
        }
      };
      canvas.onmouseup = (e) => {
        if (e.button == 0) {
          this.controllerStatus.moveObject = false;
          this.controllerStatus.moveObjectOffset = undefined;
          this.controllerStatus.moveStatus = false;
          this.controllerStatus.movePlane = undefined;
          this.controllerStatus.moveCameraPosition = undefined;
          this.controllerStatus.rotateStatus = false;
          this.controllerStatus.pivotPosition = undefined;
          this.controllerStatus.rotateObject = false;
        } else if (e.button == 1) {
          this.controllerStatus.rotateStatus = false;
          this.controllerStatus.pivotPosition = undefined;
          this.controllerStatus.rotateObject = false;
        } else if (e.button == 2) {
          this.controllerStatus.zoomStatus = false;
          this.controllerStatus.zoomCameraPosition = undefined;
        }
      }
    },
    initKey() {
      window.onkeydown = (e) => {
        this.controllerStatus.ctrlStatus = e.ctrlKey;
        this.controllerStatus.shiftStatus = e.shiftKey;
        this.controllerStatus.altStatus = e.altKey;
      };
      window.onkeyup = (e) => {
        this.controllerStatus.ctrlStatus = e.ctrlKey;
        this.controllerStatus.shiftStatus = e.shiftKey;
        this.controllerStatus.altStatus = e.altKey;
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