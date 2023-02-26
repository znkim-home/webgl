<template>
  <div
    class="dev-tool"
    style="left: 0px; top: 0px"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <div class="header" v-on:click="isShow = !isShow">
      <h3>Options</h3>
      <div class="show-hide">show/hide</div>
    </div>
    <div v-show="isShow">
      <div class="block-group">
        <button class="mini-btn" v-on:click="this.$parent.initPosition()">InitPos</button>
        <button class="mini-btn" v-on:click="this.$parent.removeObj(selectedObjects)">Remove</button>
        <button class="mini-btn" v-on:click="this.$parent.removeAll()">RemoveAll</button>
      </div>
      <div class="block-group">
        <label>SCALE</label>
        <input type="range" v-model.number="localOptions.scale" min="1" max="20" step="1" :title="localOptions.scale"/>
      </div>
      <div class="block-group">
        <label>HEADING</label>
        <input type="range" v-model.number="localOptions.rotationZ" min="0" max="360" step="1" v-on:input="rotateSelectedObject" :title="localOptions.rotationZ"/>
      </div>
      <div class="block-group">
        <label>PITCH</label>
        <input type="range" v-model.number="localOptions.rotationX" min="0" max="360" step="1" v-on:input="rotateSelectedObject" :title="localOptions.rotationX"/>
      </div>
      <div class="block-group">
        <label>ROLL</label>
        <input type="range" v-model.number="localOptions.rotationY" min="0" max="360" step="1" v-on:input="rotateSelectedObject" :title="localOptions.rotationY"/>
      </div>
      <h2>CAMERA OPTIONS</h2>
      <button class="mini-btn" v-on:click="localOptions.cameraMode = 0">Orbit</button>
      <button class="mini-btn" v-on:click="localOptions.cameraMode = 1">FirstPerson</button>
      <button class="mini-btn" v-on:click="localOptions.cameraMode = 2">ThirdPerson</button>
      <div class="block-group">
        <label>FOVY</label>
        <input type="range" v-model.number="globalOptions.fovyDegree" min="15" max="180" step="1" :title="globalOptions.fovyDegree" />
      </div>
      <div class="block-group">
        <label>NEAR</label>
        <input type="range" v-model.number="globalOptions.near" min="0.1" max="100000000.0" step="1" :title="globalOptions.near" />
      </div>
      <div class="block-group">
        <label>FAR</label>
        <input type="range" v-model.number="globalOptions.far" min="0.1" max="100000000.0" step="1" :title="globalOptions.far"/>
      </div>
      <h2>SUN OPTIONS</h2>
      <div class="block-group">
        <label>RADIUS</label>
        <input type="range" v-model.number="globalOptions.sunRadius" min="0" max="8192" step="1" :title="globalOptions.sunRadius" />
      </div>
      <h2>WEBGL OPTIONS</h2>
      <div class="block-group">
        <input type="checkbox" v-model="globalOptions.cullFace"><label>CULL-FACE</label>
        <input type="checkbox" v-model="globalOptions.depthTest"><label>DEPTH-TEST</label>
        <input type="checkbox" v-model="globalOptions.debugMode"><label>DEBUG-MODE</label>
        <input type="checkbox" v-model="globalOptions.wireFrame"><label>WIRE-FRAME</label>
      </div>
      <h2>RENDER OPTIONS</h2>
      <div class="block-group">
        <input type="checkbox" v-model="globalOptions.enableSsao"><label>ENABLE-SSAO</label>
        <input type="checkbox" v-model="globalOptions.enableGlobalLight"><label>ENABLE-SHADOW</label>
        <input type="checkbox" v-model="globalOptions.enableEdge"><label>ENABLE-EDGE</label>
      </div>
      <select v-model="localOptions.blockSize" class="mini-btn">
        <option value="2">2X2</option>
        <option value="4">4X4</option>
        <option value="8">8X8</option>
        <option value="16">16X16</option>
        <option value="32">32X32</option>
        <option value="64">64X64</option>
        <option value="128">128X128</option>
        <option value="256">256X256</option>
      </select>
      <button class="mini-btn" v-on:click="this.$parent.reload(false)">ReloadBlocks</button>
      <button class="mini-btn" v-on:click="this.$parent.reload(true)">ReloadBatchedBlocks</button>
      <button class="mini-btn" v-on:click="this.$parent.batchAll(true)">BatchAll</button>
    </div>
  </div>
  <globe-controller-component v-if="localOptions.cameraMode == 0" :web-gl="webGl"></globe-controller-component>
  <first-person-controller-component v-if="localOptions.cameraMode == 1" :web-gl="webGl"></first-person-controller-component>
  <third-person-controller-component v-if="localOptions.cameraMode == 2" :web-gl="webGl"></third-person-controller-component>
</template>
<script>
import FirstPersonControllerComponent from "../controllers/FirstPersonControllerComponent.vue";
import ThirdPersonControllerComponent from "../controllers/ThirdPersonControllerComponent.vue";
import GlobeControllerComponent from "../controllers/GlobeControllerComponent.vue";

import { mapGetters } from "vuex";

import {mat2, mat3, mat4, vec2, vec3, vec4} from 'gl-matrix';
import {WebGL, Cube, Polygon, Rectangle, Cone, Point, Line, Cylinder, Sphere, Obj, Ring, Tube} from "@/assets/crispy-waffle";

export default {
  name: "OptionsComponent",
  components: {
    GlobeControllerComponent,
    FirstPersonControllerComponent,
    ThirdPersonControllerComponent,
  },
  props: {
    webGl: Object,
  },
  data() {
    return {
      isShow : true,
      localOptions: {
        cameraMode: 0,
        scale: 5.0,
        rotationX: 0.0,
        rotationY: 0.0,
        rotationZ: 0.0,
        blockSize : 8,
        maxHeight : 6,
      },
    };
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
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      
    },
    getSelectedObject() {
      if (this.selectedObjects.length > 0) {
        return this.selectedObjects[0];
      }
      return undefined;
    },
    getSelectedObjects() {
      return this.selectedObjects;
    },
    selectObjects(id) {
      let selectedObject = this.webGl.renderableObjectList.findById(id);
      if (selectedObject) {
        this.localOptions.rotationX = selectedObject.rotation[0];
        this.localOptions.rotationY = selectedObject.rotation[1];
        this.localOptions.rotationZ = selectedObject.rotation[2];
        this.selectedObjects.length = 0;
        this.selectedObjects.push(selectedObject);
        this.globalOptions.selectedObjectId = id;
      }
      return this.selectedObjects;
    },
    diselectObjects() {
      let selectedObjects = this.selectedObjects;
      if (selectedObjects || selectedObjects.length > 0) {
        this.localOptions.rotationX = 0;
        this.localOptions.rotationY = 0;
        this.localOptions.rotationZ = 0;
        this.selectedObjects.length = 0;
        this.globalOptions.selectedObjectId = undefined;
      }
      return selectedObjects;
    },
    rotateSelectedObject() {
      let selectedObject = this.getSelectedObject();
      if (selectedObject) {
        selectedObject.rotation[0] = this.localOptions.rotationX;
        selectedObject.rotation[1] = this.localOptions.rotationY;
        selectedObject.rotation[2] = this.localOptions.rotationZ;
        selectedObject.dirty = true;
      }
    },
    initPosition(dist = 2048) {
      const camera = this.webGl.camera;
      camera.init();
      camera.setPosition(0, 0, dist);
      camera.rotate(0, 0, 0);
    },
  }
};
</script>
<style scoped>
.dev-tool ul {
  height: 100px;
  min-width: 320px;
  overflow-y: scroll;
  background-color: #222222;
  margin: 5px 0px;
}
.dev-tool ul > li{
  font-size: 11px;
  padding: 7px 5px;
  cursor: pointer;
}
.dev-tool ul > li:nth-child(odd) {
  background-color: #1b1b1b;
}
.dev-tool ul > li.selected {
  color: red;
  background-color: #ffff64;
  font-weight: bold;
}
</style>