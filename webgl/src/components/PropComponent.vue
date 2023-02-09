<template>
  <div class="dev-tool" 
    style="right: 0px; top: 0px"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <div class="header">
      <h3>Props</h3>
      <div class="show-hide" v-on:click="isShow = !isShow">show/hide</div>
    </div>
    <div v-show="isShow">
      <ul>
        <li v-on:click="selectProp(undefined)" :class="{selected : (selectedProp === undefined)}">NONE</li>
        <li v-for="(prop, index) in propList" :key="index" v-on:click="selectProp(index)" :class="{selected : (selectedProp === index)}">{{prop.name}}</li>
      </ul>
      <h2>OBJECT OPTIONS</h2>
      <input type="file" class="mini-btn" id="fileUpload" accept=".obj" v-on:change="readObj"/>
    </div>
  </div>
</template>
<script>
import {mat2, mat3, mat4, vec2, vec3, vec4} from 'gl-matrix';
import {WebGL, Cube, Polygon, Rectangle, Cone, Point, Line, Cylinder, Sphere, Obj, Ring, Tube} from "@/assets/crispy-waffle";

export default {
  name: "PropComponent",
  props: {
    webGl: Object,
  },
  data() {
    return {
      isShow : true,
      propList : [],
      selectedProp : undefined,
      loadedProp : undefined
    };
  },
  mounted() {
    this.init();
    this.initEvent();
  },
  methods: {
    init() {
      const primitiveProps = [Cube, Cylinder, Cone, Sphere, Ring, Tube];
      //const primitiveProps = [Cube, Cylinder, Cone, Sphere, Rectangle, Point, Line, Polygon, Obj];
      this.propList = primitiveProps;
    },
    initEvent() {
      let canvas = document.getElementById("glcanvas");
      canvas.addEventListener('click', (e) => {
        const webGl = this.webGl;
        const camera = webGl.camera;
        const mouseX = e.x;
        const mouseY = canvas.height - e.y;
        let ratioX = mouseX / canvas.width;
        let ratioY = mouseY / canvas.height;
        if (this.selectedProp !== undefined) {
          let depth = webGl.depthFbo.getDepth(mouseX, mouseY) + 5;
          let pos = this.getScreenPosition(ratioX, ratioY, canvas.width, canvas.height, depth);
          this.createProp(pos);
        }
      });
    },
    selectProp(index) {
      if (index === undefined) {
        this.selectedProp = undefined;
      } else {
        this.selectedProp = index;
      }
    },
    createProp(pos) {
      if (this.selectedProp !== undefined) {
        let webGl = this.webGl;
        let textures = this.$parent.$data.textures;
        const options = {
          name: "DIRT",
          position: { x: pos[0], y: pos[1], z: pos[2]},
          color: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
          height: 256,
          innerRadius: 75.0,
          radius: 100.0,
          scale: 5.0,
          texture : textures[1],
          texturePosition : [0, 0],
          rotation: { heading : 0.0, pitch : 0.0, roll : 0.0},
        };

        let selected = this.propList[this.selectedProp];
        if (selected === Obj) {
          if (this.loadedProp !== undefined) {
            this.loadedProp.forEach(loaded => {
              let r = Math.ceil(Math.random() * 10) / 10;
              let g = Math.ceil(Math.random() * 10) / 10;
              let b = Math.ceil(Math.random() * 10) / 10;
              options.color = {r, g, b}
              let prop = new Obj(options, loaded);
              webGl.renderableObjectList.push(prop);
            })
          }
        } else {
          let prop = new this.propList[this.selectedProp](options);
          webGl.renderableObjectList.push(prop);
        }
        this.selectedProp = undefined;
      }
    },
    readObj(e) {
      let that = this;
      let file = e.target.files[0];
      if (e.target.files[0]) {
        let reader = new FileReader();
        reader.onload = (progressEvent) => {
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
          that.loadedProp = groups;
        };
        reader.readAsText(file);
      }
    },
    getRay(x, y, width, height) {
      const webGl = this.webGl;
      const camera = webGl.camera;
      let ray = camera.getViewRay({
        x : x,
        y : y,
        width : width,
        height : height,
      }, 1);
      let rotationMatrix = camera.getRotationMatrix();
      let ray4 = vec4.transformMat4(vec4.create(), vec4.fromValues(ray[0], ray[1], ray[2], 1), rotationMatrix);
      return vec3.fromValues(ray4[0], ray4[1], ray4[2]);
    },
    getScreenPosition(x, y, width, height, depth) {
      const webGl = this.webGl;
      const camera = webGl.camera;
      let ray3 = this.getRay(x, y, width, height, depth);
      vec3.scale(ray3, ray3, depth);
      vec3.add(ray3, camera.position, ray3);
      return ray3;
    }
  }
};
</script>
<style scoped>

.dev-tool ul {
  height: 150px;
  overflow-y: scroll;
  background-color: #222222;
  margin: 5px 0px;
}
.dev-tool ul > li{
  font-size: 10px;
  padding: 5px;
  display: inline-block;
  min-width: 50px;
  min-height: 50px;
  margin-left: 4px;
  margin-top: 4px;
  border-radius: 5px;
  background-color: #525252;
  text-align: center;
  line-height: 50px;
  cursor: pointer;
}
.dev-tool ul > li:hover {
  color: rgb(199, 199, 199);
  background-color: #414141;
  font-weight: bold;
}
.dev-tool ul > li.selected {
  color: white;
  background-color: #7c7c7c;
  border: 1px solid;
  font-weight: bold;
  padding: 4px;
}
</style>