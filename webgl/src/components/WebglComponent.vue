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
    style="left: 0px; top: 0px"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <h3>TOOLS</h3>
    <div class="block-group">
      <button class="mini-btn" v-on:click="initPosition()">InitPosition</button>
      <button class="mini-btn" v-on:click="getExtrusion()">Extrusion</button>
      <button class="mini-btn" v-on:click="removeAll()">removeAllObject</button>
    </div>
    <h2>OBJECT INFO</h2>
    <input type="number" class="mini-btn" v-model="objectCount" v-on:change="uploadObj" readonly/>
    <h2>OBJECT OPTIONS</h2>
    <input type="file" class="mini-btn" id="fileUpload" accept=".obj" v-on:change="uploadObj"/>
    <div class="block-group">
      <label>SCALE</label>
      <input type="range" v-model="localOptions.scale" min="1" max="10" step="1" />
    </div>
    <div class="block-group">
      <label>HEADING-ROTATION</label>
      <input type="range" v-model="localOptions.rotation" min="0" max="360" step="1" />
    </div>
    <h2>CAMERA OPTIONS</h2>
    <button class="mini-btn" v-on:click="thirdMode = false">FirstPerson</button>
    <button class="mini-btn" v-on:click="thirdMode = true">ThirdPerson</button>
    <div class="block-group">
      <label>FOVY</label>
      <input type="range" v-model="globalOptions.fovyDegree" min="15" max="180" step="1" />
    </div>
    <div class="block-group">
      <label>NEAR</label>
      <input type="range" v-model="globalOptions.near" min="0.1" max="10000.0" step="1" />
    </div>
    <div class="block-group">
      <label>FAR</label>
      <input type="range" v-model="globalOptions.far" min="0.1" max="200000.0" step="1" />
    </div>
    <h2>WEBGL OPTIONS</h2>
    <div class="block-group">
      <input type="checkbox" v-model="globalOptions.cullFace"><label>CULL-FACE</label>
      <input type="checkbox" v-model="globalOptions.depthTest"><label>DEPTH-TEST</label>
      <input type="checkbox" v-model="globalOptions.debugMode"><label>DEBUG-MODE</label>
    </div>
    <h2>RENDER OPTIONS</h2>
    <div class="block-group">
      <input type="checkbox" v-model="globalOptions.enableSsao"><label>ENABLE-SSAO</label>
      <input type="checkbox" v-model="globalOptions.enableGlobalLight"><label>ENABLE-SHADOW</label>
      <input type="checkbox" v-model="globalOptions.enableEdge"><label>ENABLE-EDGE</label>
    </div>
    <h2>RENDER OPTIONS</h2>
    <select v-model="localOptions.blockSize" class="mini-btn">
      <option value="4">4X4</option>
      <option value="8">8X8</option>
      <option value="16">16X16</option>
      <option value="32">32X32</option>
      <option value="64">64X64</option>
      <option value="128">128X128</option>
      <option value="256">256X256</option>
    </select>
    <button class="mini-btn" v-on:click="reload()">ReloadBlocks</button>
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
import BufferBatch from '@/assets/service/funcional/BufferBatch';

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
      loadedObjs: [],
      localOptions: {
        scale: 5.0,
        rotation: 0.0,
        blockSize : 8,
        maxHeight : 8,
      },
      globalOptions: {
        cullFace : true,
        depthTest : true,
        fovyDegree : 70,
        aspect : undefined,
        near : 0.1,
        far : 20000.0,
        pointSize : 5.0,
        lineWidth : 3.0,
        debugMode : true,
        enableSsao : true,
        enableGlobalLight : true,
        enableEdge : true,
      }
    };
  },
  mounted() {
    this.init();
    //this.initConsole();
  },
  computed: {
    objectCount: {
      get() {
        if (this.webGl) {
          return this.webGl.renderableObjectList.size();
        } else {
          return 0;
        }
      },
      set() {
        console.log("can't do it");
      },
    }
  },
  methods: {
    init() {
      let canvas = document.getElementById("glcanvas");
      let webGl = new WebGL(canvas, this.globalOptions);
      this.webGl = webGl;
      webGl.startRender();
      this.initImage();
      const dist = 2048;
      this.initPosition(dist);
      this.base(2048, 2048);
      this.initBlocks();
    },
    uploadObj(e) {
      //console.log(e);
      let _this = this;
      let file = e.target.files[0];
      if (e.target.files[0]) {
        let reader = new FileReader();
        reader.onload = function(progressEvent) {
          let objText = progressEvent.target.result;
          let startFace = false;
          let vertices = [];
          let groups = [{
            vertices : [],
            faces : [],
            allVertices : vertices,
          }];
          let groupNum = 0;

          objText = objText.replaceAll("\r", "");

          let lines = objText.split("\n");
          lines.forEach((line) => {
            if (startFace && line.indexOf("f ") != 0 && line.indexOf("usemtl") != 0 &&  line.indexOf("s ") != 0) {
              startFace = false;
              groups.push({
                vertices : [],
                faces : [],
                allVertices : vertices
              });
              groupNum++;
            }

            if (line.indexOf("v ") == 0) {
              vertices.push(line.replace("v ", ""));
              groups[groupNum].vertices.push(line.replace("v ", ""));
            } else if (line.indexOf("f ") == 0) {
              groups[groupNum].faces.push(line.replace("f ", ""));
              startFace = true;
            }
          });
          _this.loadedObjs = groups;
        };
        reader.readAsText(file);
      }
    },
    removeBlocks() {
      if (!this.blocks) {
        return;
      }
      let loop = this.blocks.BLOCK_SIZE;
      for (let x = 0; x < loop; x++) {
        for (let y = 0; y < loop; y++) {
          for (let z = 0; z < loop; z++) {
            let blockObj = this.blocks.pos[x][y][z];
            if (blockObj) {
              this.removeObj(blockObj);
            }
          }
        }
      }
    },
    initBlocks() {
      this.removeBlocks();
      this.blocks = {
        BLOCK_SIZE : this.localOptions.blockSize,
        MAX_HEIGHT : this.localOptions.maxHeight,
      }
      const MAX_VALUE = this.blocks.BLOCK_SIZE;
      const MAX_HEIGHT = this.blocks.MAX_HEIGHT;
      let xpos = [];
      for (let x = 0; x < MAX_VALUE; x++) {
        let ypos = [];
        for (let y = 0; y < MAX_VALUE; y++) {
          let zpos = [];
          for (let z = 0; z < MAX_HEIGHT; z++) {
            zpos[z] = 0;
          }
          ypos.push(zpos);
        }
        xpos.push(ypos);
      }
      this.blocks.pos = xpos;
    },
    initGround(isAdd = true) {
      let createdList = [];
      const OFFSET = this.blocks.BLOCK_SIZE / 2;
      const MAX_VALUE = this.blocks.BLOCK_SIZE;
      const MAX_HEIGHT = this.blocks.MAX_HEIGHT;
      for (let x = 0; x < MAX_VALUE; x++) {
        for (let y = 0; y < MAX_VALUE; y++) {
          let randomValue = Math.ceil(Math.randomInt(0) / 4) + 1;
          for (let z = 0; z < MAX_HEIGHT; z++) {
            if (z < randomValue) {
              let originX = (x - OFFSET) * 128;
              let originY = (y - OFFSET) * 128;
              let originZ = z * 128;
              let polygon = (z <= 0) ? this.createStone([originX, originY, originZ / 2], isAdd) : this.createDirt([originX, originY, originZ / 2], isAdd);
              this.blocks.pos[x][y][z] = polygon;
              createdList.push(polygon);
            }
          }
        }
      }
      return createdList;
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
      let createdList = this.initGround(false);
      setTimeout(() => {
        /*let filteredObjs = this.webGl.renderableObjectList.get().filter((renderableObj) => {
          return renderableObj instanceof Polygon;
        });*/

        let filteredObjs = createdList;

        let results = BufferBatch.batch100(this.webGl.gl, filteredObjs);
        this.webGl.renderableObjectList.removeAll();
        results.forEach((result) => {
          this.webGl.renderableObjectList.push(result);
        })
        console.log(this.webGl.renderableObjectList);
      }, 100)
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
    removeAll() {
      this.webGl.renderableObjectList.removeAll();
    },
    createObject(options) {
      options.image = this.images[2];
      options.scale = this.localOptions.scale;
      this.loadedObjs.forEach(loadedObj => {
        let r = Math.ceil(Math.random() * 10) / 10;
        let g = Math.ceil(Math.random() * 10) / 10;
        let b = Math.ceil(Math.random() * 10) / 10;
        options.color = {r, g, b}
        let object = new Obj(options, loadedObj);
        this.webGl.renderableObjectList.push(object);
      })
      //let object = new Obj(options, this.loadedObj);
      //this.webGl.renderableObjectList.push(object);
      //return object;
    },
    createCylinder(options) {
      options.image = this.images[2];
      let cylinder = new Cylinder(options);
      this.webGl.renderableObjectList.push(cylinder);
      return cylinder;
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
    createPolygon(coordinates, options, isAdd = true) {
      let polygon = new Polygon(coordinates, options);
      if (isAdd) {
        this.webGl.renderableObjectList.push(polygon);
      } else {
        polygon.createRenderableObjectId(this.webGl.renderableObjectList);
      }
      options.color = {r : 0.0, g : 1.0, b : 0.0, a : 1.0};
      options.image = undefined;
      return polygon;
    },
    createDirt(origin, isAdd = true) {
      let coordinates = [[-64, -64], [64, -64], [64, 64], [-64, 64]];
      let polygon = this.createPolygon(coordinates, {
        position: { x: origin[0] + 64, y: origin[1] + 64, z: origin[2]},
        color: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
        height: 128,
        image : this.images[0]
      }, isAdd);
      return polygon;
    },
    createStone(origin, isAdd = true) {
      let coordinates = [[-64, -64], [64, -64], [64, 64], [-64, 64]];
      let polygon = this.createPolygon(coordinates, {
        position: { x: origin[0] + 64, y: origin[1] + 64, z: origin[2]},
        color: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
        height: 128,
        image : this.images[1]
      }, isAdd);
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
  },
};
</script>
<style scoped>
.dev-tool {
  width: 500px;
  min-height: 50px;
  max-height: 600px;
  position: absolute;
  display: block;
  z-index: 10;
  background-color: #0e0e0e;
  opacity: 0.75;
  border-radius: 10px;
  margin: 10px 10px 10px 10px;
  padding: 10px;
  color: white;
  color-scheme: dark;
}
.block-group {
  display : block;
}
.dev-tool label {
	font-size: 10px;
  display: inline-block;
  height: 20px;
  line-height: 20px;
  margin: 5px 10px;
  vertical-align: middle;
}
.dev-tool input{
  vertical-align: middle;
}
.dev-tool input[type="range"] {
	display: inline-block;
  height: 20px;
  vertical-align: middle;
  width: 200px;
}
.dev-tool > input[type="file"] {
	display: block;
}
.dev-tool > .console {
  padding: 5px;
  font-size: 12px;
  color: white;
  height: 100px;
  width: 465px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  margin: 10px auto;
  margin-bottom: 10px;
  border: 1px solid #1f1f1f;
}
.dev-tool h3 {
  font-size: 15px;
  padding: 5px 10px;
  padding-bottom: 7px;
  font-weight: bold;
  color: #0084ff;
}
.dev-tool h2 {
    font-size: 12px;
    padding: 5px 3px;
    padding-bottom: 3px;
    font-weight: bold;
    color: #004d96;
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
button.mini-btn, input.mini-btn {
  padding: 5px 10px;
  margin: 3px;
  background-color: #313131;
  border-radius: 3px;
  border: 0px;
  font-size: 10px;
  font-weight: unset;
}
</style>