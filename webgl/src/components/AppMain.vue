<template>
  <div class="home">
    <canvas id="glcanvas" width="1024" height="800">
      Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
    </canvas>
  </div>
</template>

<script>
const vertexShaderContext = `
  attribute vec3 aVertexPosition;
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  }
`;
const fragmentShaderContext = `
  void main(void) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`;
export default {
  name: 'WebGL',
  data() {
    return {
      gl: null,
      canvas: null,
      shaderProgram: null,
      fragmentShader: null,
      vertexShader: null,
      squareVerticesBuffer: null,
      mvMatrxi: null,
      perspectiveMatrix: null,
    }
  },
  mounted() {
    this.init();
    this.drawScene();
    this.gl.useProgram(this.shaderProgram);
  },
  methods: {
    init() {
      this.gl = null;
      this.canvas = document.getElementById("glcanvas");
      this.initWebGL();
      this.initShader();
    },
    initWebGL() {
      try {
        this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
      } catch(e) {
        console.error(e);
      }
      if (!this.gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        this.gl = null;
      }
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      return this.gl;
    },
    initShader() {
      this.fragmentShader = this.getShader("x-shader/x-fragment");
      this.vertexShader = this.getShader("x-shader/x-vertex");
      this.shaderProgram = this.gl.createProgram();
      this.gl.attachShader(this.shaderProgram, this.vertexShader);
      this.gl.attachShader(this.shaderProgram, this.fragmentShader);
      this.gl.linkProgram(this.shaderProgram);
      if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
      }
      let vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
      this.gl.enableVertexAttribArray(vertexPositionAttribute);
    },
    initBuffers() {
      let gl = this.gl;
      this.squareVerticesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesBuffer);
      var vertices = [
        1.0,  1.0,  0.0,
        -1.0, 1.0,  0.0,
        1.0,  -1.0, 0.0,
        -1.0, -1.0, 0.0
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    },
    getShader(type) {
      let gl = this.gl;
      let shader;
      if (type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, fragmentShaderContext);
      } else if (type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, vertexShaderContext);
      } else {
        return null;
      }
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
          return null;
      }
      return shader;
    },
    drawScene() {
      let gl = this.gl;
      if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.createPerspective();
      }
    },
    createPerspective() {
      const fieldOfView = 45 * Math.PI / 180;   // in radians
      const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
      const zNear = 0.1;
      const zFar = 100.0;
      const projectionMatrix = self.glMatrix.mat4.create();
      self.glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

      const modelViewMatrix = self.glMatrix.mat4.create();
      self.glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

      {
        const numComponents = 2;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
        this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        this.gl.enableVertexAttribArray(
            this.programInfo.attribLocations.vertexPosition);
      }
      
      this.gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
      this.gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
    }
  }
}
</script>
<style scoped>

</style>