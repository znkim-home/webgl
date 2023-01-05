<template>
  <div
    v-if="consoleTools"
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
    style="right: 0px; bottom: 0px"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <h3>tools</h3>
    <button class="mini-btn" v-on:click="initPosition()">initPos</button>
    <button class="mini-btn" v-on:click="getExtrusion()">extrusion</button>
    <button class="mini-btn" v-on:click="thirdMode = false">firstPerson</button>
    <button class="mini-btn" v-on:click="thirdMode = true">thirdPerson</button>
    <button class="mini-btn" v-on:click="reload()">reload</button>
  </div>
  <div
    id="home"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <canvas id="glcanvas" width="1024" height="800">SAMPLE</canvas>
  </div>
  <first-person-controller-component v-if="!thirdMode" :web-gl="webGl" :blocks="blocks"></first-person-controller-component>
  <third-person-controller-component v-if="thirdMode" :web-gl="webGl" :blocks="blocks"></third-person-controller-component>
</template>
<script>
import FirstPersonControllerComponent from "./FirstPersonControllerComponent.vue";
import ThirdPersonControllerComponent from "./ThirdPersonControllerComponent.vue";
import WebGL from "@/assets/service/WebGL.js";
import Cube from "@/assets/service/Cube.js";
import Polygon from "@/assets/service/Polygon.js";
import Rectangle from "@/assets/service/Rectangle.js"
import Point from "@/assets/service/Point.js";
import Line from "@/assets/service/Line.js";
import Cylinder from "@/assets/service/Cylinder";
import Obj from "@/assets/service/Obj";

export default {
  name: "WebglComponent",
  components: {
    FirstPersonControllerComponent,
    ThirdPersonControllerComponent,
  },
  data() {
    return {
      thirdMode: true,
      drawTools: true,
      consoleTools: false,
      webGl: undefined,
      blocks: undefined,
    };
  },
  mounted() {
    this.init();
    //this.initConsole();
  },
  methods: {
    init() {
      let canvas = document.getElementById("glcanvas");
      let webGl = new WebGL(canvas);
      this.webGl = webGl;
      webGl.startRender();
      this.initImage();
      const dist = 2048;
      this.initPosition(dist);
      this.base(2048, 2048);
      this.initBlocks();
    },
    initBlocks() {
      this.blocks = {
        BLOCK_SIZE : 16
      }
      const MAXVALUE = this.blocks.BLOCK_SIZE;
      let xpos = [];
      for (let x = 0; x < MAXVALUE; x++) {
        let ypos = [];
        for (let y = 0; y < MAXVALUE; y++) {
          let zpos = [];
          for (let z = 0; z < MAXVALUE; z++) {
            zpos[z] = 0;
          }
          ypos.push(zpos);
        }
        xpos.push(ypos);
      }
      this.blocks.pos = xpos;
    },
    initGround() {
      const OFFSET = this.blocks.BLOCK_SIZE / 2;
      const MAXVALUE = this.blocks.BLOCK_SIZE;
      for (let x = 0; x < MAXVALUE; x++) {
        for (let y = 0; y < MAXVALUE; y++) {
          let randomValue = Math.ceil(Math.randomInt(0) / 4) + 1;
          for (let z = 0; z < MAXVALUE; z++) {
            if (z < randomValue) {
              let originX = (x - OFFSET) * 128;
              let originY = (y - OFFSET) * 128;
              let originZ = z * 128;
              let polygon = (z <= 0) ? this.createStone([originX, originY, originZ / 2]) : this.createDirt([originX, originY, originZ / 2]);
              this.blocks.pos[x][y][z] = polygon;
            }
          }
        }
      }
    },
    initPosition(dist = 2048){
      const camera = this.webGl.camera;
      camera.init();
      camera.setPosition(0, 0, dist);
      camera.rotate(0, 0, 0);
    },
    initImage() {
      this.images = [];
      let imagePaths = ["/image/cube/dirt.png", "/image/cube/stone.png", "/image/cube/cobblestone.png"];
      let imageLength = imagePaths.length;

      let loadedCount = 0;
      imagePaths.forEach((imagePath, index) => {
        let image = new Image();
        image.crossOrigin = "";
        image.onload = () => {
          console.log("loaded : ", imagePath);
          this.images[index] = image;
          loadedCount++;
          //this.images[index] = image;
          if (imageLength == loadedCount) {
            console.log("inited!");
            this.initGround();
          }
        }
        image.src = imagePath;
      });
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
        this.webGl.renderableObjectList.push(rectangle);
        options.color = {r : 0.0, g : 1.0, b : 0.0, a : 1.0};
        options.image = image;
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
                let correctCoord = this.correctCoord(coordinate, 100000);
                minx = correctCoord[0] < minx ? correctCoord[0] : minx;
                miny = correctCoord[1] < miny ? correctCoord[1] : miny;
                maxx = correctCoord[0] > maxx ? correctCoord[0] : maxx;
                maxy = correctCoord[1] > maxy ? correctCoord[1] : maxy;
                return correctCoord;
              })
              .reverse();
            extrusions.push({
              height: feature.properties.build_height * 2,
              coordinates: resultCoordinates,
            });
          });
          let posx = (minx + maxx) / 2;
          let poxy = (miny + maxy) / 2;
          extrusions.forEach((extrusion) => {
            this.createPolygon(extrusion.coordinates, {
              position: { x: -posx, y: -poxy, z: 0 },
              color: { r: 0.7, g: 0.7, b: 0.7, a: 1.0 },
              height: extrusion.height,
              image : this.images[2]
            });
          });
        });
    },
    reload() {
      this.initBlocks();
      this.initGround();
    },
    setZeroPosition() {
      const webGl = this.webGl;
      const camera = webGl.camera;
      camera.setPosition(0, 0, -0);
    },
    removeObj(obj) {
      let renderableObjects = this.webGl.renderableObjectList.get();
      this.webGl.renderableObjectList.set(renderableObjects.filter((renderableObj) => {
        return renderableObj.id !== obj.id;
      }));
    },
    createObject(options) {
      options.image = this.images[2];
      let object = new Obj(options);
      this.webGl.renderableObjectList.push(object);
      return object;
    },
    createCylinder(options) {
      options.image = this.images[2];
      let cylinder = new Cylinder(options);
      this.webGl.renderableObjectList.push(cylinder);
      return cylinder;
    },
    createDirt(origin) {
      let coordinates = [[-64, -64], [64, -64], [64, 64], [-64, 64]];
      let polygon = this.createPolygon(coordinates, {
        position: { x: origin[0] + 64, y: origin[1] + 64, z: origin[2]},
        color: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
        height: 128,
        image : this.images[0]
      });
      return polygon;
    },
    createStone(origin) {
      let coordinates = [[-64, -64], [64, -64], [64, 64], [-64, 64]];
      let polygon = this.createPolygon(coordinates, {
        position: { x: origin[0] + 64, y: origin[1] + 64, z: origin[2]},
        color: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
        height: 128,
        image : this.images[1]
      });
      return polygon;
    },
    createCube(options) {
      let cube = new Cube(options);
      this.webGl.renderableObjectList.push(cube);
    },
    createPoint(options) {
      let point = new Point(options);
      this.webGl.renderableObjectList.push(point);
    },
    createLine(coordinates, options) {
      let line = new Line(coordinates, options);
      this.webGl.renderableObjectList.push(line);
      return line;
    },
    createPolygon(coordinates, options) {
      let polygon = new Polygon(coordinates, options);
      this.webGl.renderableObjectList.push(polygon);
      options.color = {r : 0.0, g : 1.0, b : 0.0, a : 1.0};
      options.image = undefined;
      return polygon;
    },
    initConsole(consoleLimit = 50000) {
      this.consoleTools = true;
      const consoleToHtml = function () {
        let consoleDiv = document.querySelector(".console");
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