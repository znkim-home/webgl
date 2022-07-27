<template>
  <div id="home">
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
      squareRotation : 0,
      then : 0,
    }
  },
  mounted() {
    this.init();
    let canvas = this.canvas;
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
  },
  methods: {
    init() {
      this.gl = null;
      this.canvas = document.getElementById("glcanvas");
      this.initWebGL();
      this.initShader();
      this.initBuffers();

      requestAnimationFrame(this.render);
    },
    render(now) {
      now *= 0.001;  // convert to seconds
      const factor = 1;
      const deltaTime = (now - this.then) * factor;
      this.then = now;
      this.drawScene(deltaTime);
      requestAnimationFrame(this.render);
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

      /*const positions = [
        1.0,  1.0,
        -1.0,  1.0,
        1.0, -1.0,
        -1.0, -1.0,
      ];*/

      const positions = [
        // Front face
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
      ];
      let squareVerticesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      /*const colors = [
        1.0,  1.0,  1.0,  1.0,
        1.0,  0.0,  0.0,  1.0,
        0.0,  1.0,  0.0,  1.0,
        0.0,  0.0,  1.0,  1.0,
      ];*/

      const faceColors = [
        [1.0,  1.0,  1.0,  1.0],    // Front face: white
        [1.0,  0.0,  0.0,  1.0],    // Back face: red
        [0.0,  1.0,  0.0,  1.0],    // Top face: green
        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        [1.0,  0.0,  1.0,  1.0],    // Left face: purple
      ];

      var colors = [];

      for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        colors = colors.concat(c, c, c, c);
      }

      let squareVerticesColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

      const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
      ];
      let indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

      this.programInfo.buffers = {
        positionBuffer : squareVerticesBuffer,
        colorBuffer : squareVerticesColorBuffer,
        indicesBuffer : indexBuffer,
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
    drawScene(deltaTime) {
      let gl = this.gl;
      if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.createPerspective();

        this.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        this.squareRotation += deltaTime;
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
      self.glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -10.0]);

      /*self.glMatrix.mat4.rotate(modelViewMatrix,  // destination matrix
                  modelViewMatrix,  // matrix to rotate
                  this.squareRotation,   // amount to rotate in radians
                  [0, 0, 1]);       // axis to rotate around*/

      self.glMatrix.mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate
      self.glMatrix.mat4.rotate(modelViewMatrix,  // destination matrix
                  modelViewMatrix,  // matrix to rotate
                  this.squareRotation,     // amount to rotate in radians
                  [0, 0, 1]);       // axis to rotate around (Z)
      self.glMatrix.mat4.rotate(modelViewMatrix,  // destination matrix
                  modelViewMatrix,  // matrix to rotate
                  this.squareRotation * .7,// amount to rotate in radians
                  [0, 1, 0]);       // axis to rotate around (Y)
      self.glMatrix.mat4.rotate(modelViewMatrix,  // destination matrix
                  modelViewMatrix,  // matrix to rotate
                  this.squareRotation * .3,// amount to rotate in radians
                  [1, 0, 0]);       // axis to rotate around (X)


      {
        const numComponents = 3;
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

      // Tell WebGL which indices to use to index the vertices
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programInfo.buffers.indicesBuffer);

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
        //const vertexCount = 4;
        //this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
        const vertexCount = 36;
        const type = this.gl.UNSIGNED_SHORT;
        this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
      }
    },

    resizeCanvasToDisplaySize(canvas) {
      // Lookup the size the browser is displaying the canvas in CSS pixels.
      const displayWidth  = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      // Check if the canvas is not the same size.
      const needResize = canvas.width  !== displayWidth ||
                        canvas.height !== displayHeight;
      if (needResize) {
        // Make the canvas the same size
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
      }
      return needResize;
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
</style>