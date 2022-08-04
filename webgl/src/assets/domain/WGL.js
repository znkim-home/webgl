import WGLShader from './WGLShader.js';
import WGLBuffer from './WGLBuffer.js';

export default class WGL {
  gl = undefined;
  canvas = undefined; 
  options = {
    backgroundColor : [0, 0, 0, 1],
    cullFace : true,
    depthTest : true,
    depthFunc : true,
  };
  models = [];
  wglShader = undefined;
  wglBuffer = undefined;

  then = 0;
  deltaTime = 0;
  rotation = 0;

  constructor(canvas, options) {
    this.canvas = canvas;
    this.initWebgl(canvas);
    this.options = options || this.options;
  }

  get gl() {
    return this.gl;
  }

  set options(value) {
    this.options = value;
  }

  initWebgl(canvas) {
    try {
      this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch(e) {
      console.error(e);
      return;
    }
    if (!this.gl) {
      alert("Unable to initialize WebGL. Your browser may not support it.");
      this.gl = null;
      return;
    }
    this.gl.viewport(0, 0, canvas.width, canvas.height);
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

  preRender() {
    const gl = this.gl;
    const options = this.options;
    //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(options.backgroundColor[0], options.backgroundColor[1], options.backgroundColor[2], options.backgroundColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (options.depthTest) {
      gl.enable(gl.DEPTH_TEST);
      if (options.depthFunc) {
        gl.depthFunc(gl.LEQUAL);
      }
    }
    this.wglShader = new WGLShader(this.gl);
    this.wglBuffer = new WGLBuffer(this.gl);

    this.models = [];

    requestAnimationFrame(this.render.bind(this));
  }

  render(now) {
    now *= 0.001;
    this.deltaTime = (now - this.then);
    this.then = now;
    this.scene();
    requestAnimationFrame(this.render.bind(this));
  }

  scene() {
    const gl = this.gl;
    const mat4 = self.glMatrix.mat4;
    const shaderInfo = this.wglShader.shaderInfo;
    const buffers = this.wglBuffer.buffers;
    this.resizeCanvasToDisplaySize(this.canvas);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    this.bindBuffer(3, buffers.positions, shaderInfo.attributeLocations.vertexPosition);
    this.bindBuffer(4, buffers.colors, shaderInfo.attributeLocations.vertexColor);

    gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    this.models.forEach((model) => {
      const offset = 0;
      const vertexCount = 36;
      const type = gl.UNSIGNED_SHORT;

      const random = () => Math.floor(Math.random() * 10 % 2);
      model.setRotation((random() ? 1 : -1) * 0.1, [random(), random() ,random()]);

      gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, model.modelMatrix);
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    });
    this.rotation += this.deltaTime;
  }

  bindBuffer(numComponents, buffer, position) {
      const gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(position, numComponents, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(position);
  }
}