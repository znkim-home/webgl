<template>
  <div
    v-if="drawTools"
    class="dev-tool"
    style="left: 0px; top: 0px"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <h3>console</h3>
    <pre class="console"></pre>
  </div>
  <div
    v-if="drawTools"
    class="dev-tool"
    style="right: 0px; top: 0px"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <h3>tools</h3>
    <button class="mini-btn" v-on:click="setZeroPosition">TEST</button>
  </div>
  <div 
    id="home"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <canvas id="glcanvas" width="1024" height="800">SAMPLE</canvas>
  </div>
  <first-person :web-gl="webGl"></first-person>
</template>
<script>
import FirstPerson from "./ControllerComponent.vue";
import WebGL from "@/assets/service/WebGL.js";
import Cube from "@/assets/service/Cube.js";
import Polygon from "@/assets/service/Polygon.js";
import { Data } from "@/assets/domain/Data.js";

export default {
  name: "WebglComponent",
  components: {
    FirstPerson,
  },
  data() {
    return {
      drawTools: false,
      webGl: undefined,
    };
  },
  mounted() {
    //this.initConsole();
    this.init();
  },
  methods: {
    base(width = 500, height = 500) {
      /*this.createCube({
        position: { x: 0, y: -250, z: 0 },
        size: { width: width, length: 10, height: height },
        color: { r: 0.3, g: 0.3, b: 0.3, a: 1.0 },
      });*/

      let unit = 8;
      let cellWidth = width / unit;
      let cellHeight = height / unit;
      let count = 0;

      let offsetX = (width / 2) - (cellWidth/2);
      let offsetY = (height / 2) - (cellHeight/2);
      for (var i = 0; i < unit; i++) {
        for (var j = 0; j < unit; j++) {
          let posX = (cellWidth * i) - offsetX;
          let posY = -250;
          let posZ = (cellHeight * j) - offsetY;

          let color = (count % 2 == 0) ? { r: 0.8, g: 0.8, b: 0.8, a: 1.0 } : { r: 0.3, g: 0.3, b: 0.3, a: 1.0 };
          this.createCube({
            position: { x: posX, y: posY, z: posZ },
            size: { width: cellWidth, length: 10, height: cellHeight },
            color: color,
          });
          count++;
        }
        count++;
      }
    },
    init() {
      let canvas = document.getElementById("glcanvas");
      let webGl = new WebGL(canvas);
      this.webGl = webGl;
      webGl.startRender(Data);

      const dist = 1000;
      const camera = webGl.camera;
      camera.setPosition(0, 0, dist);
      this.base(dist, dist);

      //let coordinates = [[2.0, 0.0], [4.0, 0.0], [6.0, 3.0], [4.0, 6.0], [0.0, 3.0], [2.0, 0.0]];
      //let coordinates = [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], [0.0, 0.0]];
      //let coordinates = [[0.0, 0.0], [3.0, 0.0], [3.0, 3.0], [2.0, 3.0], [2.0, 2.0], [1.0, 2.0], [1.0, 3.0], [0.0, 3.0], [0.0, 0.0]];
      /*let coordinates = [
        [1, 2],
        [2, 1],
        [3, 0],
        [4, 1],
        [5, 1],
        [7, 2],
        [7, 4],
        [5, 4],
        [5, 2],
        [4, 3],
        [3, 3],
        [2, 2],
        [3, 4],
        [1, 4],
        [1, 2],
      ];*/
      /*let coordinates = [[0, 0],[ -21.951406721184544,1.411658575409092],
      [ -18.931819965504577, -31.62057215112145],
      [ -59.61723169677022, -15.306965240568388],
      [ -56.59405650303388, -54.5800738594553],
      [ -19.133239075196457, -48.53889695657563],
      [ -23.76531379508372, -84.3892918180718],
      [ 18.73189854446248, -80.96566535798047],
      [ 2.61950893750002, -52.76805816630076],
      [ 41.29093343922073, -54.58027088116796],
      [ 35.6503068906377, -18.327550101821544],
      [ 3.4255374908510503, -25.37620030296239],
      ];*/
      this.getExtrusion();
    },

    correctCoord(coordinate, unit = 10000) {
      let x = coordinate[0] - Math.floor(coordinate[0]);
      let y = coordinate[1] - Math.floor(coordinate[1]);
      return [x * unit, y * unit];
    },

    getExtrusion() {
      let url =
        "http://175.197.92.213:10603/geoserver/deia/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=deia%3Aws2_extrusion&outputFormat=application%2Fjson";
      fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          let extrusions = [];

          let minx = Number.MAX_VALUE;
          let miny = Number.MAX_VALUE;
          let maxx = Number.MIN_VALUE;
          let maxy = Number.MIN_VALUE;

          let features = json.features;
          features.forEach((feature) => {
            let geometry = feature.geometry;
            let coordinates = geometry.coordinates[0][0];
            let resultCoordinates = coordinates
              .map((coordinate) => {
                let correctCoord = this.correctCoord(coordinate, 20000);
                minx = correctCoord[0] < minx ? correctCoord[0] : minx;
                miny = correctCoord[1] < miny ? correctCoord[1] : miny;
                maxx = correctCoord[0] > maxx ? correctCoord[0] : maxx;
                maxy = correctCoord[1] > maxy ? correctCoord[1] : maxy;
                return correctCoord;
              })
              .reverse();
            extrusions.push({
              height: feature.properties.build_height / 10,
              coordinates: resultCoordinates,
            });
          });

          let posx = (minx + maxx) / 2;
          let poxy = (miny + maxy) / 2;
          extrusions.forEach((extrusion) => {
            this.createPolygon(extrusion.coordinates, {
              position: { x: -posx, y: -poxy, z: 0 },
              color: { r: 1.0, g: 1.0, b: 0.0, a: 1.0 },
              height: extrusion.height,
            });
          });
        });
    },
    setZeroPosition() {
      const webGl = this.webGl;
      const camera = webGl.camera;
      camera.setPosition(0, 0, -0);
    },
    createCube(options) {
      let cube = new Cube(options);
      this.webGl.renderableObjs.push(cube);
    },
    createPolygon(coordinates, options) {
      let cube = new Polygon(coordinates, options);
      this.webGl.renderableObjs.push(cube);
    },
    initConsole(consoleLimit = 50000) {
      let consoleDiv = document.querySelector(".console");
      const consoleToHtml = function () {
        if (consoleDiv.textContent.length > consoleLimit) {
          consoleDiv.textContent = consoleDiv.textContent.substring(
            40000,
            consoleDiv.textContent.length
          );
        }
        consoleDiv.textContent += `${new Date().toLocaleString("ko-KR")} >>>`;
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
  },
};
</script>
<style scoped>
.dev-tool {
  width: 500px;
  min-height: 50px;
  max-height: 150px;
  position: absolute;
  display: block;
  z-index: 10;
  background-color: #0e0e0e;
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
  height: 80px;
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
  overflow: hidden;
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