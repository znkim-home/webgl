<template>
  <div></div>
</template>
<script>
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
      this.test = new Triangle([-500, -500, 0], [500, -500, 0], [500, 500, 0]);

      let image = new Image();
      image.crossOrigin = "";
      image.onload = () => {
        this.image = image;
      }
      //image.src = "https://random.imagecdn.app/256/256"
      image.src = "/image/dirt_512.jpg";
      //image.src = "/image/duck_256.jpg";

      const MAXX = 8;
      const MAXY = 8;
      const MAXZ = 8;

      this.blocks = {}
      let xpos = [];
      for (let x = 0; x < MAXX; x++) {
        let ypos = [];
        for (let y = 0; y < MAXY; y++) {
          let zpos = [];
          for (let z = 0; z < MAXZ; z++) {
            zpos[z] = 0;
          }
          ypos.push(zpos);
        }
        xpos.push(ypos);
      }
      this.blocks.pos = xpos;
      //console.log(this.blocks);
    },
    initMouse() {
      let canvas = document.getElementById("glcanvas");
      canvas.onmousedown = (e) => {
        const vec4 = self.glMatrix.vec4;
        const vec3 = self.glMatrix.vec3;
        const webGl = this.webGl;
        const camera = webGl.camera;
        const mouseX = e.x;
        const mouseY = canvas.height - e.y;

        let selectionId = webGl.selectionFbo.getColor(mouseX, mouseY);
        let depth = webGl.depthFbo.getDepth(mouseX, mouseY);
        let normal = webGl.normalFbo.getNormal(mouseX, mouseY);

        let ratioX = mouseX / canvas.width;
        let ratioY = mouseY / canvas.height;

        if (e.button == 1) {
          if (depth > 1500) {
            return;
          }
          depth = webGl.depthFbo.getDepth(mouseX, mouseY) + 10;
          let ray = camera.getViewRay({
            x : ratioX,
            y : ratioY,
            width : canvas.width,
            height : canvas.height,
          }, 1);
          let rotationMatrix = camera.getRotationMatrix();
          let ray4 = vec4.transformMat4(vec4.create(), vec4.fromValues(ray[0], ray[1], ray[2], 1), rotationMatrix);
          let ray3 = vec3.fromValues(ray4[0], ray4[1], ray4[2]);
          vec3.scale(ray3, ray3, depth);
          let cameraPos = vec3.clone(camera.position);
          vec3.add(ray3, cameraPos, ray3);

          let blockX = Math.floor(ray3[0] / 128);
          let blockY = Math.floor(ray3[1] / 128);
          let blockZ = Math.floor(Math.abs(ray3[2] + 1) / 128);
          let test = this.blocks.pos[blockX + 4][blockY + 4][blockZ];
          if (test === undefined) {
            console.log("범위 밖");
            return;
          } else if (test != 0) {
            this.$parent.removeObj(test);
            this.blocks.pos[blockX + 4][blockY + 4][blockZ] = 0;
            return;
          }
          console.log(selectionId, depth, normal);
        } else if (e.button == 2) {
          if (this.mouseStatus) {
            this.mouseStatus = false;
            document.exitPointerLock();
          } else {
            this.mouseStatus = true;
            canvas.requestPointerLock();
          }
        } else if (e.button == 0) {
          if (depth > 1500) {
            return;
          }
          depth = webGl.depthFbo.getDepth(mouseX, mouseY) - 10;
          let ray = camera.getViewRay({
            x : ratioX,
            y : ratioY,
            width : canvas.width,
            height : canvas.height,
          }, 1);
          let rotationMatrix = camera.getRotationMatrix();
          let ray4 = vec4.transformMat4(vec4.create(), vec4.fromValues(ray[0], ray[1], ray[2], 1), rotationMatrix);
          let ray3 = vec3.fromValues(ray4[0], ray4[1], ray4[2]);
          vec3.scale(ray3, ray3, depth);
          let cameraPos = vec3.clone(camera.position);
          vec3.add(ray3, cameraPos, ray3);

          let blockX = Math.floor(ray3[0] / 128);
          let blockY = Math.floor(ray3[1] / 128);
          let blockZ = Math.floor(Math.abs(ray3[2] + 1) / 128);
          let valx = blockX * 128;
          let valy = blockY * 128;
          let valz = blockZ * 128 / 2;
          let valpos = vec3.fromValues(valx, valy, valz);

          let test = this.blocks.pos[blockX + 4][blockY + 4][blockZ];
          if (test === undefined) {
            console.log("범위 밖");
            return;
          } else if (test != 0) {
            return;
          }
          let coordinates = [[-64, -64], [64, -64], [64, 64], [-64, 64]];
          let polygon = this.$parent.createPolygon(coordinates, {
            position: { x: valpos[0] + 64, y: valpos[1] + 64, z: valpos[2]},
            color: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
            height: 128,
            image : this.image
          });
          this.blocks.pos[blockX + 4][blockY + 4][blockZ] = polygon;
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
      const moveMs = 16; // 66:15fps 33:30fps , 16:60fps
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