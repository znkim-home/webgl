<template>
  <div id="home">
    <canvas id="glcanvas" width="1024" height="800">SAMPLE</canvas>
  </div>
</template>
<script>
import WebGL from '@/assets/service/WebGL.js';
import Cube from '@/assets/service/Cube.js';
import {Data} from '@/assets/domain/Data.js';

export default {
  name: 'WebglComponent',
  data() {
    return {
      webGl : undefined,
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let canvas = document.getElementById("glcanvas");
      let webGl = new WebGL(canvas);
      webGl.test = [0,0,-10];
      webGl.startRender(Data);
      this.webGl = webGl;

      this.createCube({
        position : {x : 0, y : 0, z : 0},
        size : {width : 6, length : 3, height : 10},
        color : {r : 1.0, g : 0.0, b : 0.0, a : 1.0}
      });

      this.createCube({
        position : {x : -5, y : -3, z : 3},
        size : {width : 3, length : 9, height : 3},
        color : {r : 0.0, g : 1.0, b : 0.0, a : 1.0}
      });

      this.createCube({
        position : {x : 5, y : 5, z : -5},
        size : {width : 3, length : 3, height : 3},
        color : {r : 0.0, g : 0.0, b : 1.0, a : 1.0}
      });

      this.createCube({
        position : {x : 0, y : 10, z : -5},
        size : {width : 3, length : 3, height : 3},
        color : {r : 0.0, g : 0.8, b : 0.8, a : 1.0},
        rotation : {pitch : -45, roll : 0, heading : 0}
      });

      this.initKey();
    },
    createCube(options) {
      let cube = new Cube(options);
      this.webGl.renderableObjs.push(cube);
    },
    initKey() {
      window.onkeyup = (e) => {
        console.log(e);
      };
      window.onkeypress = (e) => {
        console.log(e);
      };
      window.onkeydown = (e) => {
        this.isPressd = true;
        //console.log(e);
        const webGl = this.webGl;
        const camera = webGl.camera;

        const MOVE_FACTOR = 2;
        const ROTATE_FACTOR = 5; // degree
        let key = e.key;
        if (key == 'w') {
          camera.moveForward(-MOVE_FACTOR);
        } else if (key == 's') { 
          camera.moveForward(MOVE_FACTOR);
        } else if (key == 'a') {
          camera.moveRight(-MOVE_FACTOR);
        } else if (key == 'd') {
          camera.moveRight(MOVE_FACTOR);
        } else if (key == 'q') {
          camera.moveUp(MOVE_FACTOR);
        } else if (key == 'e') {
          camera.moveUp(-MOVE_FACTOR);
        } else if (key == 'ArrowUp') {
          camera.rotate(0, ROTATE_FACTOR, 0);
        } else if (key == 'ArrowDown') {
          camera.rotate(0, -ROTATE_FACTOR, 0);
        } else if (key == 'ArrowRight') {
          camera.rotate(-ROTATE_FACTOR, 0, 0);
        } else if (key == 'ArrowLeft') {
          camera.rotate(ROTATE_FACTOR, 0, 0);
        } else if (key == ',') {
          camera.rotate(0, 0, -ROTATE_FACTOR);
        } else if (key == '.') {
          camera.rotate(0, 0, ROTATE_FACTOR);
        }
      };
    }
  }
}
</script>
<style scoped>
  #home {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow :hidden;
  }
  #home canvas {
    width: 100%;
    height: 100%;
  }
</style>