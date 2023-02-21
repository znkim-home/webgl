<template>
  <div
    v-if="isUse"
    class="dev-tool"
    style="right: 0px; bottom: 15px"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <div class="header" v-on:click="isShow = !isShow">
      <h3>Dev Console</h3>
      <div class="show-hide">show/hide</div>
    </div>
    <div v-show="isShow">
      <pre class="console"></pre>
    </div>
  </div>
</template>
<script>
import {mat2, mat3, mat4, vec2, vec3, vec4} from 'gl-matrix';
import {WebGL, Cube, Polygon, Rectangle, Cone, Point, Line, Cylinder, Sphere, Obj, Ring, Tube} from "@/assets/crispy-waffle";

export default {
  name: "ConsoleComponent",
  props: {
    webGl: Object,
  },
  data() {
    return {
      isUse : false,
      isShow : false,
    };
  },
  mounted() {
    this.init();
  },
  unmounted() {
    this.unsetConsole();
  },
  methods: {
    init() {
      if (this.isUse) {
        this.initConsole();
      }
    },
    initConsole(consoleLimit = 50000) {
      const consoleToHtml = function () {
        let consoleDiv = document.querySelector(".console");
        if (consoleDiv.textContent.length > consoleLimit) {
          consoleDiv.textContent = consoleDiv.textContent.substring(
            40000,
            consoleDiv.textContent.length
          );
        }
        consoleDiv.textContent += `${new Date().toLocaleString("ko-KR")} >>`;
        Array.from(arguments).forEach((el) => {
          consoleDiv.textContent += " ";
          const insertValue = typeof el === "object" ? JSON.stringify(el) : el;
          consoleDiv.textContent += insertValue;
        });
        consoleDiv.textContent += "\n";
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
        window.console.logCopy(...arguments);
      };
      window.console.logCopy = window.console.log;
      window.console.log = consoleToHtml;
    },
    unsetConsole() {
      window.console.logCopy = window.console.log;
      window.console.log =  window.console.logCopy;
    }
  }
};
</script>
<style scoped>
</style>