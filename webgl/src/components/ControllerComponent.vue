<template>
  <div></div>
</template>
<script>
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
      canvas.onmousewheel = (e) => {
        if (e.deltaY != 0) {
          const webGl = this.webGl;
          const ROTATE_FACTOR = 0.1;
          let yValue = e.deltaY * ROTATE_FACTOR;
          let degree = webGl.fovDegree + yValue;
          if (degree > 0 && degree < 180) {
            webGl.fovDegree = degree;
          }
        }
      };
      canvas.onmousedown = () => {
        if (this.mouseStatus) {
          this.mouseStatus = false;
          document.exitPointerLock();
        } else {
          this.mouseStatus = true;
          canvas.requestPointerLock();
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
            camera.rotate(-xValue, 0, 0);
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