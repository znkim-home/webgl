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

      let cube = new Cube({
        position : {
          x : 0,
          y : 0,
          z : 0
        }, size : {
          width : 5,
          length : 3,
          height : 2
        }
      });
      webGl.renderableObjs.push(cube);
      
      let cube2 = new Cube({
        position : {
          x : 5,
          y : 5,
          z : -15
        }, size : {
          width : 7,
          length : 1,
          height : 7
        }
      });
      webGl.renderableObjs.push(cube2);

      let cube3 = new Cube({
        position : {
          x : -10,
          y : 5,
          z : 5
        }, size : {
          width : 3,
          length : 3,
          height : 3
        }
      });
      webGl.renderableObjs.push(cube3);

      this.webGl = webGl;
      this.initKey();
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
        console.log(e);
        const webGl = this.webGl;
        const camera = webGl.camera;

        const MOVE_FACTOR = 0.3;
        const ROTATE_FACTOR = 1; // degree
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