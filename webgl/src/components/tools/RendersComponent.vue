<template>
  <div
    class="dev-tool"
    style="left: 0px; bottom: 0px"
    oncontextmenu="return false"
    ondragstart="return false"
    onselectstart="return false"
  >
    <div class="header" v-on:click="isShow = !isShow">
      <h3>Renders</h3>
      <div class="show-hide">show/hide</div>
    </div>
    <div v-show="isShow">
      <h2>OBJECT INFO</h2>
      <input type="number" class="mini-btn" v-model="renderableObject.length" readonly/>
      <ul>
        <li v-for="(renderable, index) in renderableObject" :key="renderable.id" v-on:click="this.$parent.selectObjects(renderable.id)" :class="{selected : (renderable == selectedObjects[0])}">{{`[${index}] : ${renderable.name}, ${renderable.id}`}}</li>
      </ul>
    </div>
  </div>
</template>
<script>
import {mat2, mat3, mat4, vec2, vec3, vec4} from 'gl-matrix';
import {WebGL, Cube, Polygon, Rectangle, Cone, Point, Line, Cylinder, Sphere, Obj, Ring, Tube} from "@/assets/crispy-waffle";

import { mapGetters } from "vuex";

export default {
  name: "RendersComponent",
  props: {
    webGl: Object,
  },
  data() {
    return {
      isShow : false,
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
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      
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