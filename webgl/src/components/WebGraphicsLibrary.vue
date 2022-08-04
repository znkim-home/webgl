<template>
  <div id="controller">
    <label>개수</label>
    <input type="range" name="count" min="1" max="10000" v-model="count" @input="setModels()"/>
    <input type="text" name="count" v-model="count" readonly />
  </div>
  <div id="home">
    <canvas id="glcanvas" width="1024" height="800">
      Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
    </canvas>
  </div>
</template>

<script>
import WGL from '@/assets/domain/WGL.js';
import Model from '@/assets/domain/Model.js';

export default {
  name: 'WebGraphicsLibraryComponent',
  data() {
    return {
      canvas : null,
      webGraphicsLibrary : null,
      count : 1000
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.canvas = document.getElementById("glcanvas");
      this.webGraphicsLibrary = new WGL(this.canvas);
      this.webGraphicsLibrary.preRender();
      this.setModels(null, this.count)
    },
    setModels() {
      const models = this.webGraphicsLibrary.models;
      this.count = parseInt(this.count);
      if (models.length > this.count) {
        models.length = this.count;
        if (this.count == 0) {
          models.length = 0;
        }
        return;
      }

      const max = this.count;
      const range = 200;
      const random = (inRange) => Math.floor(Math.random() * inRange) / 10;

      const getOneOrTwo = () => (Math.floor(Math.random() * 10 % 2) ? 1 : -1);
      const test = () => (Math.floor(Math.random() * 10) / 10);

      for (let loop = models.length; loop < max; loop++) {
        const x = random(range) * getOneOrTwo();
        const y = random(range) * getOneOrTwo();
        const scale = test() / 4;
        //console.log(x, y);
        let model = new Model([x, y, -20]);
        model.setScale([scale, scale, scale]);
        models.push(model);
      }
    }
  }
}
</script>
<style scoped>
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

#controller {
  width: 300px;
  height: 100px;
  position: fixed;
  background-color: #303039;
  display: block;
  opacity: 0.25;
  border-radius: 8px;
  margin: 20px;
  padding: 15px;
}
#controller:hover {
  opacity: 0.75;
}
#controller label {
  color : white;
}

#controller > * {
  float: left;
  margin-right: 15px;
  line-height: 20px;
}

#controller input {
  width: 100px;
}
#controller input[type="range"] {
  width: 150px;
}
#controller input[type="text"] {
  width: 50px;
  text-align: right;
  color: white;
  background-color: #39393c;
  border: 1px solid #2b2a3e;
  border-radius: 5px;
  padding: 0px 7px;
}

</style>