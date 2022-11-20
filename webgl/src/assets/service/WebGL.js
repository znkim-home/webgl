import Shader from './Shader.js';
import Buffer from './Buffer.js';
import Camera from './Camera.js';

export default class WebGL {
  gl = undefined;
  canvas = undefined;
  shader = undefined;
  buffer = undefined;
  camera = undefined;

  now = undefined;

  constructor(canvas) {
    this.canvas = canvas;
    this.init();
  }
  get gl() {
    return this.gl;
  }

  init() {
    const canvas = this.canvas;
    try {
      this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch(e) {
      console.error(e);
      return;
    }
    if (!this.gl) {
      console.error("Unable to initialize WebGL. Your browser may not support it.");
      return;
    }
    const gl = this.gl;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
  resizeCanvas() {
    const canvas = this.canvas;
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const needResize = (canvas.width !== displayWidth) || (canvas.height !== displayHeight);
    if (needResize) {
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
    return needResize;
  }
  startRender(data) {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this.shader = new Shader(gl);
    this.buffer = new Buffer(gl);
    this.shader.init(data.vertexShaderSource, data.fragmentShaderSource);
    this.buffer.init(data);
    this.camera = new Camera();
    this.camera.setPosition(15, 5, 15);
    this.camera.rotate(45, -15, 0);
    requestAnimationFrame(this.render.bind(this));
  }
  render(now) {
    this.now = now;
    //console.log(now);
    //now *= 0.001;
    //this.deltaTime = (now - this.then);
    //this.then = now;
    this.scene();
    requestAnimationFrame(this.render.bind(this));
  }
  
  scene() {
    const gl = this.gl;
    const canvas = this.canvas;
    const mat4 = self.glMatrix.mat4;
    const shader = this.shader;
    const buffer = this.buffer;

    const shaderInfo = shader.shaderInfo;
    const buffers = buffer.buffers;

    this.resizeCanvas();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0.2, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fov = this.toRadian(45); // FieldOfView
    const aspect = canvas.width / canvas.height; // Aspect ratio
    const near = 0.1; // Near Frustum
    const far = 100.0; // Far Frustum

    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fov, aspect, near, far);
    let modelViewMatrix = this.camera.getModelViewMatrix();
    
    this.bindBuffer(3, buffers.positions, shaderInfo.attributeLocations.vertexPosition);
    this.bindBuffer(4, buffers.colors, shaderInfo.attributeLocations.vertexColor);
    
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.ModelViewMatrix, false, modelViewMatrix);

    const offset = 0;
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  bindBuffer(numComponents, buffer, position) {
      const gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(position, numComponents, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(position);
  }

  toRadian(degree) {
    return degree * Math.PI / 180;
  }
}