<template>
  <div
    v-if="drawTools"
    class="dev-tool"
    style="left: 0px; bottom: 0px"
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
    style="left: 0px; bottom: 160px"
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
import Rectangle from "@/assets/service/Rectangle.js"
import Point from "@/assets/service/Point.js";
import Line from "@/assets/service/Line.js";
import { Data } from "@/assets/domain/Data.js";

export default {
  name: "WebglComponent",
  components: {
    FirstPerson,
  },
  data() {
    return {
      drawTools: true,
      webGl: undefined,
    };
  },
  mounted() {
    //this.initConsole();
    this.init();
  },
  methods: {
    init() {
      let canvas = document.getElementById("glcanvas");
      let webGl = new WebGL(canvas);
      this.webGl = webGl;
      webGl.startRender(Data);

      const dist = 1024;
      const camera = webGl.camera;
      camera.setPosition(0, 0, dist * 2);
      camera.rotate(0, 0, 0);
      this.base(1024, 1024);
      //this.getExtrusion();
    },
    correctCoord(coordinate, unit = 10000) {
      let x = coordinate[0] - Math.floor(coordinate[0]);
      let y = coordinate[1] - Math.floor(coordinate[1]);
      return [x * unit, y * unit];
    },
    base(width = 500, height = 500) {
      let halfWidth = width / 2;
      let halfHeight = height / 2;
      let image = new Image(); 
      image.onload = () => {
        let coordinates = [[-halfWidth, -halfHeight], [halfWidth, -halfHeight], [halfWidth, halfHeight], [-halfWidth, halfHeight]];
        let options = {
          position: { x: 0, y: 0, z: 0 },
          color: { r: 1.0, g: 1.0, b: 0.0, a: 1.0 },
          image : image
        }
        let rectangle = new Rectangle(coordinates, options);
        this.webGl.renderableObjs.push(rectangle);
        options.color = {r : 0.0, g : 1.0, b : 0.0, a : 1.0};
        options.image = undefined;

        //let rectangle2 = new Rectangle(coordinates, options);
        this.webGl.renderableObjsT.push(rectangle);
      }
      image.src = "/image/chess.png";
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
                let correctCoord = this.correctCoord(coordinate, 80000);
                minx = correctCoord[0] < minx ? correctCoord[0] : minx;
                miny = correctCoord[1] < miny ? correctCoord[1] : miny;
                maxx = correctCoord[0] > maxx ? correctCoord[0] : maxx;
                maxy = correctCoord[1] > maxy ? correctCoord[1] : maxy;
                return correctCoord;
              })
              .reverse();
            extrusions.push({
              height: feature.properties.build_height,
              coordinates: resultCoordinates,
            });
          });

          let posx = (minx + maxx) / 2;
          let poxy = (miny + maxy) / 2;
          extrusions.forEach((extrusion) => {
            this.createPolygon(extrusion.coordinates, {
              position: { x: -posx, y: -poxy, z: 0 },
              color: { r: 0.3, g: 0.3, b: 0.3, a: 1.0 },
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
    removeObj(obj) {
      this.webGl.renderableObjs = this.webGl.renderableObjs.filter((renderableObj) => {
        return renderableObj.id !== obj.id;
      });
    },
    createCube(options) {
      let cube = new Cube(options);
      this.webGl.renderableObjs.push(cube);
    },
    createPoint(options) {
      let point = new Point(options);
      this.webGl.renderableObjs.push(point);
    },
    createLine(coordinates, options) {
      let line = new Line(coordinates, options);
      this.webGl.renderableObjs.push(line);
      return line;
    },
    createPolygon(coordinates, options) {
      let polygon = new Polygon(coordinates, options);
      this.webGl.renderableObjs.push(polygon);
      options.color = {r : 0.0, g : 1.0, b : 0.0, a : 1.0};
      options.image = undefined;
      return polygon;
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