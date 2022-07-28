import {EzBuffer} from './EzBuffer.js';
import {EzShader} from './EzShader.js';

export default class EzWebGL {
  constructor(canvas) {
    this.gl = null;
    this.ezShader = null;
    this.ezBuffer = null; 
    this.squareRotation = 0;
    this.then = 0;
    this.deltaTime = 0;

    this.initWebgl(canvas);
    this.initShader();
    this.initBuffer();
    requestAnimationFrame(this.render.bind(this));
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

  drawScene() {
    let gl = this.gl;
    if (gl) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      this.createPerspective();
      this.resizeCanvasToDisplaySize(gl.canvas);
      this.squareRotation += this.deltaTime;
    }
  }

  createPerspective() {
    let gl = this.gl;
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = self.glMatrix.mat4.create();
    self.glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = self.glMatrix.mat4.create();
    self.glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -15.0]);        
    self.glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.squareRotation, [0, 0, 1]);
    self.glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.squareRotation * 0.7, [0, 1, 0]);
    self.glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.squareRotation * 0.3, [1, 0, 0]);

    let buffers = this.ezBuffer.getBuffers();
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(this.ezShader.getAttribLocations().vertexPosition, numComponents, type, normalize, stride, offset);
      gl.enableVertexAttribArray(this.ezShader.getAttribLocations().vertexPosition);
    }

    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.vertexAttribPointer(this.ezShader.getAttribLocations().vertexColor, numComponents, type, normalize, stride, offset);
      gl.enableVertexAttribArray(this.ezShader.getAttribLocations().vertexColor);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.uniformMatrix4fv(this.ezShader.getUniformLocations().projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(this.ezShader.getUniformLocations().modelViewMatrix, false, modelViewMatrix);
      
    {
      const offset = 0;
      const vertexCount = 36;
      const type = gl.UNSIGNED_SHORT;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
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
    now *= 0.001;
    this.deltaTime = (now - this.then);
    this.then = now;
    this.drawScene(this.deltaTime);
    requestAnimationFrame(this.render.bind(this));
  }
}