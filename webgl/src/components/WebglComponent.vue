<template>
  <div class="dev-info fps" style="right: 0px; bottom: 13px">{{`[X : ${cameraPosition[0]}, Y : ${cameraPosition[1]}, Z : ${cameraPosition[2]}]`}}</div>
  <div class="dev-info fps" style="right: 0px; bottom: 0px">{{`${fps} FPS`}}</div>
  <div
    id="home"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <canvas id="glcanvas" width="1024" height="800">SAMPLE</canvas>
  </div>
  <options-component :web-gl="webGl"></options-component>
  <console-component :web-gl="webGl"></console-component>
  <prop-component :web-gl="webGl"></prop-component>
  <renders-component :web-gl="webGl"></renders-component>
</template>
<script>
//import {WebGL, Cube, Polygon, Rectangle, Point, Line, Cylinder, Obj, Buffer, BufferBatch} from "crispy-waffle";
import {WebGL, Cube, Polygon, Rectangle, Point, Line, Cylinder, Obj, Buffer, BufferBatch, Sphere, Globe, MapTile} from "@/assets/crispy-waffle";

import { mapGetters } from "vuex";

import PropComponent from "./tools/PropComponent.vue";
import RendersComponent from "./tools/RendersComponent.vue"
import ConsoleComponent from "./tools/ConsoleComponent.vue"
import OptionsComponent from "./tools/OptionsComponent.vue"

export default {
  name: "WebglComponent",
  components: {
    OptionsComponent,
    ConsoleComponent,
    PropComponent,
    RendersComponent,
  },
  data() {
    return {
      fps : 0,
      cameraPosition: [],
      blocks: undefined,
      loadedObjs: [],
      textures: [],
      images: [],

      webGl: undefined,
    };
  },
  mounted() {
    this.init();
  },
  computed: {
    ...mapGetters({
      globalOptions: "getGlobalOptions",
      selectedObjects: "getSelectedObjects",
    }),
    renderableObject: {
      get() {
        if (this.webGl) {
          return this.webGl.renderableObjectList.get();
        } else {
          return [];
        }
      },
      set() {
        console.log("can't do it");
      },
    }
  },
  methods: {
    getFps() {
      let webGl = this.webGl;
      setInterval(() => {
        if (webGl) {
          this.fps = webGl.fps.frame;
          this.cameraPosition = webGl.fps.cameraPosition;
        }
      }, 100);
    },
    init() {
      let canvas = document.getElementById("glcanvas");
      let webGl = new WebGL(canvas, this.globalOptions);
      this.webGl = webGl;
      webGl.startRender();
      this.initImage();
      const dist = 6378137.0;
      this.blocks = {
        BLOCK_SIZE : 0,
        MAX_HEIGHT : 0,
      }
      this.initPosition(dist * 4);
      this.baseGlobeWMS(dist);
      this.getFps();
    },

    uploadObj(e) {
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
    createRandomValue() {
      const MAX_HEIGHT = this.blocks.MAX_HEIGHT;
      let value = Math.randomInt(0) % (MAX_HEIGHT);
      if (value < 4) {
        value = 3;
      }
      return value;
    },
    initGround(isAdd = true) {
      let createdList = [];
      const OFFSET = this.blocks.BLOCK_SIZE / 2;
      const MAX_VALUE = this.blocks.BLOCK_SIZE;
      const MAX_HEIGHT = this.blocks.MAX_HEIGHT;
      for (let x = 0; x < MAX_VALUE; x++) {
        for (let y = 0; y < MAX_VALUE; y++) {
          let randomValue = this.createRandomValue();
          for (let z = 0; z < MAX_HEIGHT; z++) {
            if (z < randomValue) {
              let originX = (x - OFFSET) * 128;
              let originY = (y - OFFSET) * 128;
              let originZ = z * 128;
              let polygon;
              if (z > 1) {
                polygon = this.createDirt([originX, originY, originZ], isAdd)
              } else if (z > 0) {
                polygon = this.createStone([originX, originY, originZ], isAdd)
              } else if (z == 0) {
                polygon = this.createObsidian([originX, originY, originZ], isAdd)
              }
              this.blocks.pos[x][y][z] = polygon;
              createdList.push(polygon);
            }
          }
        }
      }
      return createdList;
    },
    initPosition(dist = 6378137.0 * 4) {
      const camera = this.webGl.camera;
      camera.init();
      camera.setPosition(0, 0, dist);
      camera.rotate(0, 0, 0);
    },
    initImage() {
      this.images = [];
      this.textures = [];
      let imagePaths = [
        "/image/cube/dirt.png", 
        "/image/cube/stone.png", 
        "/image/cube/cobblestone.png", 
        "/image/cube/minecraft-texture.png", 
        "/image/cube/wood.jpg", 
        "/image/cube/globe.jpg", 
        "/image/cube/grid.jpg",
        "/image/cube/earth.jpg",
      ];
      let imageLength = imagePaths.length;
      let glBuffer = new Buffer(this.webGl.gl);
      let loadedCount = 0;
      imagePaths.forEach((imagePath, index) => {
        let image = new Image();
        image.crossOrigin = "";
        image.onload = () => {
          console.log("loaded : ", imagePath);
          this.images[index] = image;
          this.textures[index] = glBuffer.createTexture(image);
          loadedCount++;
          if (imageLength == loadedCount) {
            console.log("inited!");
            //this.initGround();
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
    baseGlobeWMS() {
      let level = 3;
      let levelPow = Math.pow(2, level);
      let latOffset = 180 / levelPow;
      let lonOffset = 360 / levelPow;
      for (let x = 0; x < levelPow; x++) {
        for (let y = 0; y < levelPow; y++) {
          let latitudeMin = (latOffset * y) - 90;
          let latitudeMax = (latOffset * (y + 1)) - 90;
          let longitudeMin = (lonOffset * x) - 180;
          let longitudeMax = (lonOffset * (x + 1)) - 180;
          let lonlatRange = {latitudeMin, latitudeMax, longitudeMin, longitudeMax}
          let image = new Image(); 
          image.crossOrigin = "";
          image.onload = () => {
            let options = {
              position: { x: 0, y: 0, z: 0 },
              color: { r: 1.0, g: 1.0, b: 0.0, a: 1.0 },
              image : image,
              rotation: {pitch: 0, roll: 0, heading: 0},
              lonlatRange : lonlatRange
            }
            let globe = new MapTile(options);
            this.webGl.renderableObjectList.push(globe);
            options.color = {r : 0.0, g : 1.0, b : 0.0, a : 1.0};
            options.image = image;
          }
          
          //image.src = `https://tile.openstreetmap.org/${level}/${x}/${y}.png`;
          image.src = `https://tile-c.openstreetmap.fr/hot/${level}/${x}/${y}.png`;
          //image.src = `https://maps.gnosis.earth/ogcapi/collections/blueMarble/map/tiles/WebMercatorQuad/${level}/${y}/${x}.jpg`
        } 
      }
    },
    baseGlobe(radius = 500) {
      let image = new Image(); 
      image.onload = () => {
        let options = {
          id : 0,
          position: { x: 0, y: 0, z: 0 },
          color: { r: 1.0, g: 1.0, b: 0.0, a: 1.0 },
          image : image,
          rotation: {pitch: 0, roll: 0, heading: 0}
        }
        let globe = new MapTile(options);
        this.webGl.renderableObjectList.push(globe);
        options.color = {r : 0.0, g : 1.0, b : 0.0, a : 1.0};
        options.image = image;
      }
      image.src = "/image/cube/globe.jpg";
    },
    base(width = 500, height = 500) {
      let halfWidth = width / 2;
      let halfHeight = height / 2;
      let image = new Image(); 
      image.onload = () => {
        let coordinates = [[-halfWidth, -halfHeight], [halfWidth, -halfHeight], [halfWidth, halfHeight], [-halfWidth, halfHeight]];
        let options = {
          id : 8612,
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
    batchAll() {
      let results = BufferBatch.batch100(this.webGl.gl, this.webGl.renderableObjectList.renderableObjects);
      this.webGl.renderableObjectList.removeAll();
      results.forEach((result) => {
        this.webGl.renderableObjectList.push(result);
      })
    },
    reload(isBatch = false) {
      this.initBlocks();
      if (isBatch) {
        let createdList = this.initGround(false);
        setTimeout(() => {
          let filteredObjs = createdList;
          let results = BufferBatch.batch100(this.webGl.gl, filteredObjs);
          this.webGl.renderableObjectList.removeAll();
          results.forEach((result) => {
            this.webGl.renderableObjectList.push(result);
          })
          console.log(this.webGl.renderableObjectList);
        }, 100)
      } else {
        this.webGl.renderableObjectList.removeAll();
        this.initGround(true);
      }
    },
    removeObj(objects) {
      console.log(objects);
      if (objects && objects.length > 0) {
        objects.forEach((object) => {
          if (object !== undefined) {
            let renderableObjects = this.webGl.renderableObjectList.get();
            this.webGl.renderableObjectList.set(renderableObjects.filter((renderableObj) => {
              return renderableObj.id !== object.id;
            }));
          }
        })
      }
    },
    removeAll() {
      this.webGl.renderableObjectList.removeAll();
      const dist = 2048;
      this.base(dist, dist);
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
    },
    createCylinder(options) {
      options.image = this.images[2];
      let cylinder = new Cylinder(options);
      this.webGl.renderableObjectList.push(cylinder);
      return cylinder;
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
    createCube(options, isAdd = true) {
      let cube = new Cube(options);
      if (isAdd) {
        this.webGl.renderableObjectList.push(cube);
      } else {
        cube.createRenderableObjectId(this.webGl.renderableObjectList);
      }
      return cube;
    },
    createPolygon(coordinates, options, isAdd = true) {
      let polygon = new Polygon(coordinates, options);
      if (isAdd) {
        this.webGl.renderableObjectList.push(polygon);
      } else {
        polygon.createRenderableObjectId(this.webGl.renderableObjectList);
      }
      options.image = undefined;
      return polygon;
    },
    createDirt(origin, isAdd = true) {
      let cube = this.createCube({
        name: "DIRT",
        position: { x: origin[0] + 64, y: origin[1] + 64, z: origin[2]},
        color: { r: 0.3, g: 0.3, b: 0.3, a: 1.0 },
        height: 128,
        texture : this.textures[3],
        texturePosition : [2, 26]
      }, isAdd);
      return cube;
    },
    createObsidian(origin, isAdd = true) {
      let cube = this.createCube({
        name: "OBSIDIAN",
        position: { x: origin[0] + 64, y: origin[1] + 64, z: origin[2]},
        color: { r: 0.3, g: 0.3, b: 0.3, a: 1.0 },
        height: 128,
        texture : this.textures[3],
        texturePosition : [10, 16]
      }, isAdd);
      return cube;
    },
    createStone(origin, isAdd = true) {
      let cube = this.createCube({
        name: "STONE",
        position: { x: origin[0] + 64, y: origin[1] + 64, z: origin[2]},
        color: { r: 0.3, g: 0.3, b: 0.3, a: 1.0 },
        height: 128,
        texture : this.textures[3],
        texturePosition : [20, 22]
      }, isAdd);
      return cube;
    },
  },
};
</script>
<style>
@media ( max-width: 769px ) {
  /*.dev-tool {
    width : calc(100% - 40px) !important;
  }*/
}
.dev-info {
      min-width: 150px;
  position: absolute;
  display: block;
  color: #000;
  margin: 10px 10px 10px 10px;
  text-align: right;
  font-size: 11px;
}
.dev-tool {
  min-width: 150px;
  max-height: 600px;
  position: absolute;
  display: block;
  z-index: 10;
  background-color: #101011;
  opacity: 0.80;
  border-radius: 5px;
  margin: 10px 10px 10px 10px;
  padding: 10px;
  color: #fff;
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
  margin: 2px 8px;
  vertical-align: middle;
  min-width: 40px;
}
.dev-tool input{
  vertical-align: middle;
}
.dev-tool input[type="range"] {
	display: inline-block;
  height: 20px;
  vertical-align: middle;
  width: 220px;
}
.dev-tool > input[type="file"] {
	display: block;
}
.dev-tool .console {
  padding: 5px;
  font-size: 12px;
  color: white;
  height: 100px;
  width: 330px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  margin: 10px auto;
  margin-bottom: 10px;
  border: 1px solid #1f1f1f;
}
.dev-tool h2 {
  font-size: 11px;
  padding: 5px 5px;
  padding-bottom: 3px;
  font-weight: bold;
  color: #acacac;
}
.dev-tool h3 {
  font-size: 12px;
  margin: 5px;
  font-weight: bold;
  color: #72afe3;
  display: inline-block;
}
.dev-tool div.show-hide {
  float: right;
  font-size: 10px;
  color: #656565;
  margin: 5px;
  cursor: pointer;
}
.dev-tool div.show-hide:hover {
  color: #3b3b3b;
}
.dev-tool div.header {
  display: block;
  border-bottom: 1px solid #303030;
  margin: 5px 5px;
}
#home {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background-color: #333366;
}
#home canvas {
  width: 100%;
  height: 100%;
  background-color: #336666;
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
button.mini-btn:hover, input.mini-btn:hover {
  background-color: #404040;
}
</style>

<style scoped>
div.fps {
  opacity: 0.75;
  text-shadow: -1px 0 #fff, 0 1px #fff, 1px 0 #fff, 0 -1px #fff;
}
</style>