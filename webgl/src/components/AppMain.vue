<template>
  <div class="home">
    <canvas id="glcanvas" width="1024" height="800">
      Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
    </canvas>
  </div>
</template>

<script>

const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;
  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
`;
const fragmentShaderSource = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
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
      mvMatrxi: null,
      perspectiveMatrix: null,
      programInfo: null,
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.gl = null;
      this.canvas = document.getElementById("glcanvas");
      this.initWebGL();
      this.initShader();
      this.initBuffers();
      this.drawScene();
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
    setShaderProgram(vertexShader, fragmentShader) {
      this.shaderProgram = this.gl.createProgram();
      this.gl.attachShader(this.shaderProgram, vertexShader);
      this.gl.attachShader(this.shaderProgram, fragmentShader);
      this.gl.linkProgram(this.shaderProgram);
      if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
      }

      this.programInfo = {
        program: this.shaderProgram,
        attribLocations: {
          vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
          vertexColor: this.gl.getAttribLocation(this.shaderProgram, "aVertexColor")
        },
        uniformLocations: {
          projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
          modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
        }
      };
      this.gl.useProgram(this.shaderProgram);
    },
    initShader() {
      this.fragmentShader = this.getShader("x-shader/x-fragment");
      this.vertexShader = this.getShader("x-shader/x-vertex");
      this.setShaderProgram(this.vertexShader, this.fragmentShader);
    },
    initBuffers() {
      let gl = this.gl;

      const positions = [
        1.0,  1.0,
        -1.0,  1.0,
        1.0, -1.0,
        -1.0, -1.0,
      ];
      let squareVerticesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      const colors = [
        1.0,  1.0,  1.0,  1.0,    // 흰색
        1.0,  0.0,  0.0,  1.0,    // 빨간색
        0.0,  1.0,  0.0,  1.0,    // 녹색
        0.0,  0.0,  1.0,  1.0     // 파란색
      ];
      let squareVerticesColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

      this.programInfo.buffers = {
        positionBuffer : squareVerticesBuffer,
        colorBuffer : squareVerticesColorBuffer
      }
    },
    getShader(type) {
      let gl = this.gl;
      let shader;
      if (type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, fragmentShaderSource);
      } else if (type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, vertexShaderSource);
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
      const fieldOfView = 45 * Math.PI / 180;
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
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programInfo.buffers.positionBuffer);
        this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
      }

      {
        const numComponents = 4;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programInfo.buffers.colorBuffer);
        this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
      }

      this.gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
      this.gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
        
      {
        const offset = 0;
        const vertexCount = 4;
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
      }
    }
  }
}
</script>
<style scoped>

</style>