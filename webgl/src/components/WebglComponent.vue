<template>
  <div id="home">
    <canvas id="glcanvas" width="1024" height="800">SAMPLE</canvas>
  </div>
</template>
<script>
import WebGL from '@/assets/service/WebGL.js';
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
      this.initKey();
    },
    initKey() {
      window.onkeydown = (e) => {
        this.isPressd = true;
        console.log(e);

        const webGl = this.webGl;
        const camera = webGl.camera;
        const factor = 0.1;
        let key = e.key;
        if (key == 'w') {
          camera.moveForward(-factor);
        } else if (key == 's') { 
          camera.moveForward(factor);
        } else if (key == 'a') {
          camera.moveRight(-factor);
        } else if (key == 'd') {
          camera.moveRight(factor);
        } else if (key == 'q') {
          camera.moveUp(factor);
        } else if (key == 'e') {
          camera.moveUp(-factor);
        } else if (key == 'ArrowUp') {
          camera.rotate(0, 1, 0);
        } else if (key == 'ArrowDown') {
          camera.rotate(0, -1, 0);
        } else if (key == 'ArrowRight') {
          camera.rotate(-1, 0, 0);
        } else if (key == 'ArrowLeft') {
          camera.rotate(1, 0, 0);
        } else if (key == ',') {
          camera.rotate(0, 0, -1);
        } else if (key == '.') {
          camera.rotate(0, 0, 1);
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