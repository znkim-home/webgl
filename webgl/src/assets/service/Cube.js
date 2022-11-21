import Buffer from './Buffer.js';

export default class Cube {
  constructor(options) {
    const vec3 = self.glMatrix.vec3;
    this.pos = vec3.fromValues(0, 0, 0);
    this.rot = vec3.fromValues(0, 0, 0); // pitch, roll, heading
    this.size = vec3.fromValues(4, 6, 8); // width, length, height
    this.buffer = undefined;

    this.init(options);
  }
  
  init(options) {
    const vec3 = self.glMatrix.vec3;
    if (options?.position) {
      this.pos = vec3.set(this.pos, options.position.x, options.position.y, options.position.z);
    }
    if (options?.size) {
      this.size = vec3.set(this.size, options.size.width, options.size.length, options.size.height);
    }
    if (options?.rot) {
      this.rot = vec3.set(this.rot, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    }
  }

  render(gl, shaderInfo) {
    let buffer = this.getBuffer(gl, shaderInfo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
    buffer.bindBuffer(buffer.postionsGlBuffer);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    //gl.bindBuffer(buffer.postionsGlBuffer, shaderInfo.attributeLocations.vertexPosition);
    //this.bindBuffer(4, buffers.colors, shaderInfo.attributeLocations.vertexColor);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);//
  }

  getBuffer(gl) {
    if (this.buffer === undefined) {
      this.buffer = new Buffer(gl);
      let w = this.size[0]/2;
      let l = this.size[1]/2;
      let h = this.size[2];
      this.buffer.positionsVBO = new Float32Array([
        // bottom Face
        -w, -l, 0, // 0
         w, -l, 0, // 1
         w,  l, 0, // 2
        -w,  l, 0, // 3
        // Top Face
        -w, -l, h, // 4
         w, -l, h, // 5
         w,  l, h, // 6
        -w,  l, h  // 7
      ]);
      this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO); 
      this.buffer.indicesVBO = new Uint16Array([
        // bottom Face
        0, 1, 2,
        0, 2, 3,
        // Top Face
        4, 5, 6,
        4, 6 ,7,
        // Left Face
        3, 0 ,4,
        3, 4 ,7,
        // Right Face
        1, 2, 6,
        1, 6, 5,
        // Forward Face
        0, 1, 5,
        0, 5 ,4,
        // Backward Face
        2, 3, 7,
        2, 7, 6
      ]);
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
      this.buffer.indicesLength = this.buffer.indicesVBO.length;
    }
    return this.buffer;
  }
}