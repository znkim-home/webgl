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
        const factor = 0.1;
        let key = e.key;
        if (key == 'w') {
          webGl.camera.rotate(0, 1, 0);
        } else if (key == 's') { 
          webGl.camera.rotate(0, -1, 0);
        } else if (key == 'a') {
          webGl.camera.rotate(-1, 0, 0);
        } else if (key == 'd') {
          webGl.camera.rotate(1, 0, 0);
        } else if (key == 'e') {
          webGl.camera.rotate(0, 0, 1);
        } else if (key == 'q') {
          webGl.camera.rotate(0, 0, -1);
        } else if (key == 'ArrowUp') {
          webGl.camera.translate(0, 0, factor);
        } else if (key == 'ArrowDown') {
          webGl.camera.translate(0, 0, -factor);
        } else if (key == 'ArrowRight') {
          webGl.camera.translate(0, factor, 0);
        } else if (key == 'ArrowLeft') {
          webGl.camera.translate(0, -factor, 0);
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