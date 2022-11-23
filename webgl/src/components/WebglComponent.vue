<template>
  <div class="dev-tool" style="left:0px; top:0px;" oncontextmenu="return false" ondragstart="return false" onselectstart="return false">
    <h3>console</h3>
    <pre class="console"></pre>
  </div>
  <div class="dev-tool" style="right:0px; top:0px;" oncontextmenu="return false" ondragstart="return false" onselectstart="return false">
    <h3>tools</h3>
    <button class="mini-btn" v-on:click="setZeroPosition">TEST</button>
  </div>
  <div id="home" oncontextmenu="return false" ondragstart="return false" onselectstart="return false">
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
      mouseStatus : false,
    }
  },
  mounted() {
    this.initConsole();
    this.init();
  },
  methods: {
    init() {
      //console.log("init");
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
      this.initMouse();
    },
    setZeroPosition() {
      const webGl = this.webGl;
      const camera = webGl.camera;
      camera.setPosition(0,0,0);
    },
    createCube(options) {
      let cube = new Cube(options);
      this.webGl.renderableObjs.push(cube);
    },
    initConsole(consoleLimit = 50000) {
      let consoleDiv = document.querySelector(".console");
      const consoleToHtml = function() {
          if (consoleDiv.textContent.length > consoleLimit) {
            consoleDiv.textContent = consoleDiv.textContent.substring(40000, consoleDiv.textContent.length)
          }
          consoleDiv.textContent += `${(new Date()).toLocaleString("ko-KR")} >>>`
          Array.from(arguments).forEach(el => {
              consoleDiv.textContent += " "
              const insertValue = typeof el === "object" ? JSON.stringify(el) : el
              consoleDiv.textContent += insertValue
          })
          consoleDiv.textContent += "\n"
          consoleDiv.scrollTop = consoleDiv.scrollHeight;
          window.console.logCopy(...arguments);
      }
      window.console.logCopy = window.console.log;
      window.console.log = consoleToHtml;
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
            console.log(`SETFOV : ${webGl.fovDegree}`);
          }
        }
      }
      canvas.onmousedown = (e) => {
        console.info(e);
        this.mouseStatus = true;
      }
      canvas.onmousemove = (e) => {
        if (this.mouseStatus) {
          const webGl = this.webGl;
          const camera = webGl.camera;
          const ROTATE_FACTOR = 0.1;
          let xValue = e.movementX * ROTATE_FACTOR;
          let yValue = e.movementY * ROTATE_FACTOR;

          if (xValue != 0) {
            camera.rotate(xValue, 0, 0);
          }
          if (xValue != 0) {
            camera.rotate(0, yValue, 0);
          }
        }
      }
      canvas.onmouseup = (e) => {
        console.info(e);
        this.mouseStatus = false;
      }
    },
    initKey() {
      window.onkeyup = (e) => {
        console.info(e);
      };
      window.onkeypress = (e) => {
        console.info(e);
      };
      window.onkeydown = (e) => {
        this.isPressd = true;
        const webGl = this.webGl;
        const camera = webGl.camera;

        const MOVE_FACTOR = 1;
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
        } else {
          return;
        }
        let xPos = Math.floor(camera.pos[0]*10000)/10000;
        let yPos = Math.floor(camera.pos[1]*10000)/10000;
        let zPos = Math.floor(camera.pos[2]*10000)/10000;
        console.log(`POS : ${xPos},${yPos},${zPos}`);
      };
    }
  }
}
</script>
<style scoped>
  .dev-tool {
    width: 500px;
    min-height: 50px;
    max-height: 300px;
    position: absolute;
    display: block;
    z-index: 10;
    background-color: black;
    opacity: 0.5;
    border-radius: 10px;
    margin: 15px;
    color: white;
    color-scheme: dark;
  }
  .dev-tool > .console {
    padding: 5px;
    font-size: 12px;
    color: white;
    height: 150px;
    width: 465px;
    overflow-wrap: anywhere;
    overflow-y: auto;
    margin: 10px auto;
    margin-bottom: 20px;
    border: 1px solid #1f1f1f;
  }
  .dev-tool h3 {
      font-size: 15px;
      padding: 10px 15px;
      padding-bottom: 0px;
      font-weight: bold;
      color: #06ffe5;
  }
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
  button.mini-btn {
    padding: 5px 15px;
    margin: 10px;
    background-color: #585858;
    border-radius: 5px;
    border: 0px;
    font-size: 12px;
    font-weight: unset;
  }
</style>