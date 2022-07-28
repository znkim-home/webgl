<template>
  <div id="home">
    <canvas id="glcanvas" width="1024" height="800">
      Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
    </canvas>
  </div>
</template>

<script>
import EzWebGL from '@/assets/domain/EzWebGL.js';

export default {
  name: 'ZnkimMain',
  data() {
    return {
      canvas : null
    }
  },
  mounted() {
    this.init();
    let canvas = this.canvas;
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
  },
  methods: {
    init() {
      this.canvas = document.getElementById("glcanvas");
      let ezWebGL = new EzWebGL(this.canvas);
      ezWebGL.getGl();
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
</style>