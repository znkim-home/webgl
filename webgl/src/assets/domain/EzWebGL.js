import {EzBuffer} from './EzBuffer.js';
import {EzShader} from './EzShader.js';
import {EzKey} from './EzKey.js';
import {cameraPosition, cameraAngle} from './EzData.js';

export default class EzWebGL {
  constructor(canvas) {
    this.gl = null;
    this.ezShader = null;
    this.ezBuffer = null; 
    this.squareRotation = 0;
    this.then = 0;
    this.deltaTime = 0;

    this.projectionMatrix = null;
    this.models = [];

    this.initWebgl(canvas);
    this.initShader();
    this.initBuffer();
    this.projectionMatrix = this.createProjectionMatrix();
    requestAnimationFrame(this.render.bind(this));
    this.ezKey = new EzKey(this, this.projectionMatrix);
  }
  
  getGl() {
    return this.gl;
  }

  initWebgl(canvas) {
    try {
      this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch(e) {
      console.error(e);
    }
    if (!this.gl) {
      alert("Unable to initialize WebGL. Your browser may not support it.");
      this.gl = null;
    }
    this.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  initShader() {
    this.ezShader = new EzShader(this);
    this.shaderProgram = this.ezShader.getShaderProgram();
  }

  initBuffer() {
    this.ezBuffer = new EzBuffer(this);
  }

  randomPositions() {
    this.modelMatrixs = [];
    const count = 300000;
    const range = 1500;
    for (let loop = 0; loop < count; loop++) {
      let sampleX = (Math.floor(Math.random() * range) -(range/2));
      let sampleY = (Math.floor(Math.random() * range) -(range/2));
      let sampleZ = (Math.floor(Math.random() * range) - range);
      let modelMatrix = self.glMatrix.mat4.create();
      self.glMatrix.mat4.translate(modelMatrix, modelMatrix, [sampleX, sampleY, sampleZ]);
      this.modelMatrixs.push(modelMatrix);
    }
  }

  drawScene() {
    let gl = this.gl;
    if (gl) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      this.createPerspective();
      this.resizeCanvasToDisplaySize(gl.canvas);
      this.squareRotation += this.deltaTime;
    }
  }

  createProjectionMatrix() {
    let gl = this.gl;
    let mat4 = self.glMatrix.mat4;
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    if (this.projectionMatrix) {
      mat4.perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);
      return this.projectionMatrix;
    } else {
      const projectionMatrix = mat4.create();
      return projectionMatrix;
    }
  }

  createPerspective() {
    let gl = this.gl;
    let mat4 = self.glMatrix.mat4;

    this.projectionMatrix = this.createProjectionMatrix();
    
    const modelViewMatrix = this.createCube([-2, -2, -20.0]);
    const modelViewMatrix2 = this.createCube([2, -2, -20.0]);
    mat4.rotate(modelViewMatrix2, modelViewMatrix2, this.squareRotation, [0, 1, 1]);
    const modelViewMatrix3 = this.createCube([0, 2, -20.0]);
    mat4.rotate(modelViewMatrix3, modelViewMatrix3, -this.squareRotation, [1, 1, 0]);
    //let size = this.squareRotation / 10;
    //mat4.scale(modelViewMatrix3, modelViewMatrix3, [size, size, size]);

    const gridMatrix = mat4.create();
    mat4.translate(gridMatrix, gridMatrix, [0, 0, 0]);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    mat4.translate(this.projectionMatrix, this.projectionMatrix, cameraPosition);
    cameraAngle.toggle.forEach((toggle, index) => {
      if (toggle == 0)
        return;
      let axis = [0, 0, 0];
      axis[index] = 1;
      let radian = cameraAngle.angle[index];
      mat4.rotate(this.projectionMatrix, this.projectionMatrix, radian, axis)
    });

    //cameraPosition[2] += 0.01;

    let buffers = this.ezBuffer.getBuffers();
    this.bindBufferEz(3, buffers.position, this.ezShader.getUniformLocations().vertexPosition);
    this.bindBufferEz(2, buffers.textureCoord, this.ezShader.getAttribLocations().textureCoord);
    this.bindBufferEz(3, buffers.normal, this.ezShader.getAttribLocations().vertexNormal);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.ezBuffer.getTexture());
    gl.uniform1i(this.ezShader.getUniformLocations().uSampler, 0);

    {
      gl.uniformMatrix4fv(this.ezShader.getUniformLocations().projectionMatrix, false, this.projectionMatrix);
      gl.uniformMatrix4fv(this.ezShader.getUniformLocations().normalMatrix, false, normalMatrix);
      const offset = 0;
      const vertexCount = 36;
      const type = gl.UNSIGNED_SHORT;

      this.models.forEach((cube) => {
        gl.uniformMatrix4fv(this.ezShader.getUniformLocations().modelViewMatrix, false, cube);
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      })
    }

    {
      gl.uniformMatrix4fv(this.ezShader.getUniformLocations().modelViewMatrix, false, gridMatrix);
        gl.drawElements(gl.LINES, 8, gl.UNSIGNED_SHORT, 0);
    }
  }

  bindBufferEz(numComponents, buffer, position) {
      let gl = this.gl;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(position, numComponents, type, normalize, stride, offset);
      gl.enableVertexAttribArray(position);
  }

  createCube(vec3) {
    let mat4 = self.glMatrix.mat4;
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, vec3);
    this.models.push(modelViewMatrix);
    return modelViewMatrix;
  }

  resizeCanvasToDisplaySize(canvas) {
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const needResize = (canvas.width !== displayWidth) || (canvas.height !== displayHeight);
    if (needResize) {
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
    return needResize;
  }

  render(now) {
    this.models = [];
    now *= 0.001;
    this.deltaTime = (now - this.then);
    this.then = now;
    this.drawScene(this.deltaTime);
    requestAnimationFrame(this.render.bind(this));
  }
}