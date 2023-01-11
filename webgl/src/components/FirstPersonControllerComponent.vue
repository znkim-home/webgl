<template>
  <div></div>
</template>
<script>
const { mat2, mat3, mat4, vec2, vec3, vec4 } = self.glMatrix; // eslint-disable-line no-unused-vars

export default {
  name: "FirstPerson",
  props: {
    webGl: Object,
  },
  data() {
    return {
      keyEvent : undefined,
      controllerStatus : {
        mouseStatus: false,
        keyStatus: {},
      },
      globalOptions : {
        cameraZAxis : false,
        BLOCK_SIZE : 16,
        MOVE_FACTOR : 2,
        ROTATE_FACTOR : 0.1,
      }
    };
  },
  mounted() {
    this.init();
  },
  unmounted() {
    clearInterval(this.keyEvent);
  },
  methods: {
    init() {
      this.initKey();
      this.initMouse();
    },
    initMouse() {
      let canvas = document.getElementById("glcanvas");
      canvas.onmousedown = (e) => {
        if (e.button == 2) {
          if (this.controllerStatus.mouseStatus) {
            this.controllerStatus.mouseStatus = false;
            document.exitPointerLock();
          } else {
            this.controllerStatus.mouseStatus = true;
            canvas.requestPointerLock();
          }
        }
      };
      canvas.onmousemove = (e) => {
        if (this.controllerStatus.mouseStatus) {
          const webGl = this.webGl;
          const camera = webGl.camera;
          const ROTATE_FACTOR = this.globalOptions.ROTATE_FACTOR;

          let xValue = e.movementX * ROTATE_FACTOR;
          if (xValue != 0) {
            if (this.globalOptions.cameraZAxis) {
              camera.rotate(-xValue, 0, 0);
            } else {
              camera.rotate(0, 0, xValue);
            }
          }

          let yValue = e.movementY * ROTATE_FACTOR;
          if (yValue != 0) {
            camera.rotate(0, -yValue, 0);
          }
        }
      };
      canvas.onmouseup = () => {};
    },
    initKey() {
      const moveMs = 16; // 66:15fps 33:30fps , 16:60fps
      this.keyEvent = setInterval(() => {
        let MOVE_FACTOR = this.globalOptions.MOVE_FACTOR;
        const webGl = this.webGl;
        const camera = webGl.camera;

        let keyStatus = this.controllerStatus.keyStatus;
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
        this.controllerStatus.ctrlStatus = e.ctrlKey;
        this.controllerStatus.keyStatus[e.key] = true;
      };
      window.onkeyup = (e) => {
        this.controllerStatus.ctrlStatus = e.ctrlKey;
        this.controllerStatus.keyStatus[e.key] = false;
        if (e.key == "Escape") {
          this.controllerStatus.mouseStatus = false;
        }
      };
    },
  },
};
</script>

<style scoped>
</style>