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
    let tm = this.getTransformMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);

    let buffer = this.getBuffer(gl, shaderInfo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);

    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);

    buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    

    gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);//
  }

  getTransformMatrix() {
    const mat4 = self.glMatrix.mat4;
    const vec3 = self.glMatrix.vec3;
    let tm = mat4.create();
    mat4.identity(tm);
    mat4.rotate(tm, tm, this.toRadian(this.rot[0]), vec3.fromValues(1, 0, 0));
    mat4.rotate(tm, tm, this.toRadian(this.rot[1]), vec3.fromValues(0, 1, 0));
    mat4.rotate(tm, tm, this.toRadian(this.rot[2]), vec3.fromValues(0, 0, 1));
    tm[12] = this.pos[0];
    tm[13] = this.pos[1];
    tm[14] = this.pos[2];
    return tm;
  }

  getBuffer(gl) {
    const vec3 = self.glMatrix.vec3;
    const vec4 = self.glMatrix.vec4;
    if (this.buffer === undefined) {
      this.buffer = new Buffer(gl);
      let w = this.size[0]/2;
      let l = this.size[1]/2;
      let h = this.size[2];

      let alpha = 1.0;
      // let c0 = vec4.fromValues(1.0, 0.0, 0.0, alpha);
      // let c1 = vec4.fromValues(0.0, 1.0, 0.0, alpha);
      // let c2 = vec4.fromValues(0.0, 0.0, 1.0, alpha);
      // let c3 = vec4.fromValues(1.0, 1.0, 0.0, alpha);
      // let c4 = vec4.fromValues(1.0, 0.0, 1.0, alpha);
      // let c5 = vec4.fromValues(0.0, 1.0, 1.0, alpha);
      // let c6 = vec4.fromValues(1.0, 1.0, 1.0, alpha);
      // let c7 = vec4.fromValues(0.0, 0.0, 0.0, alpha);

      let colorRed = vec4.fromValues(1.0, 0.0, 0.0, alpha);
      let colorBlue = vec4.fromValues(0.0, 0.0, 1.0, alpha);
      let colorGreen = vec4.fromValues(0.0, 1.0, 0.0, alpha);
      let colorYellow = vec4.fromValues(1.0, 1.0, 0.0, alpha);
      let colorCyan = vec4.fromValues(0.0, 1.0, 1.0, alpha);
      let colorMagenta = vec4.fromValues(1.0, 0.0, 1.0, alpha);

      this.buffer.colorVBO = new Float32Array([
        colorRed[0], colorRed[1], colorRed[2], colorRed[3],
        colorRed[0], colorRed[1], colorRed[2], colorRed[3],
        colorRed[0], colorRed[1], colorRed[2], colorRed[3],
        colorRed[0], colorRed[1], colorRed[2], colorRed[3],
        colorRed[0], colorRed[1], colorRed[2], colorRed[3],
        colorRed[0], colorRed[1], colorRed[2], colorRed[3],

        colorBlue[0], colorBlue[1], colorBlue[2], colorBlue[3],
        colorBlue[0], colorBlue[1], colorBlue[2], colorBlue[3],
        colorBlue[0], colorBlue[1], colorBlue[2], colorBlue[3],
        colorBlue[0], colorBlue[1], colorBlue[2], colorBlue[3],
        colorBlue[0], colorBlue[1], colorBlue[2], colorBlue[3],
        colorBlue[0], colorBlue[1], colorBlue[2], colorBlue[3],

        colorGreen[0], colorGreen[1], colorGreen[2], colorGreen[3],
        colorGreen[0], colorGreen[1], colorGreen[2], colorGreen[3],
        colorGreen[0], colorGreen[1], colorGreen[2], colorGreen[3],
        colorGreen[0], colorGreen[1], colorGreen[2], colorGreen[3],
        colorGreen[0], colorGreen[1], colorGreen[2], colorGreen[3],
        colorGreen[0], colorGreen[1], colorGreen[2], colorGreen[3],

        colorYellow[0], colorYellow[1], colorYellow[2], colorYellow[3],
        colorYellow[0], colorYellow[1], colorYellow[2], colorYellow[3],
        colorYellow[0], colorYellow[1], colorYellow[2], colorYellow[3],
        colorYellow[0], colorYellow[1], colorYellow[2], colorYellow[3],
        colorYellow[0], colorYellow[1], colorYellow[2], colorYellow[3],
        colorYellow[0], colorYellow[1], colorYellow[2], colorYellow[3],

        colorCyan[0], colorCyan[1], colorCyan[2], colorCyan[3],
        colorCyan[0], colorCyan[1], colorCyan[2], colorCyan[3],
        colorCyan[0], colorCyan[1], colorCyan[2], colorCyan[3],
        colorCyan[0], colorCyan[1], colorCyan[2], colorCyan[3],
        colorCyan[0], colorCyan[1], colorCyan[2], colorCyan[3],
        colorCyan[0], colorCyan[1], colorCyan[2], colorCyan[3],

        colorMagenta[0], colorMagenta[1], colorMagenta[2], colorMagenta[3],
        colorMagenta[0], colorMagenta[1], colorMagenta[2], colorMagenta[3],
        colorMagenta[0], colorMagenta[1], colorMagenta[2], colorMagenta[3],
        colorMagenta[0], colorMagenta[1], colorMagenta[2], colorMagenta[3],
        colorMagenta[0], colorMagenta[1], colorMagenta[2], colorMagenta[3],
        colorMagenta[0], colorMagenta[1], colorMagenta[2], colorMagenta[3],
      ]);
      this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO); 

      let p0 = vec3.fromValues(-w, -l, 0);
      let p1 = vec3.fromValues(w, -l, 0);
      let p2 = vec3.fromValues(w, l, 0);
      let p3 = vec3.fromValues(-w, l, 0);
      let p4 = vec3.fromValues(-w, -l, h);
      let p5 = vec3.fromValues(w, -l, h);
      let p6 = vec3.fromValues(w, l, h);
      let p7 = vec3.fromValues(-w, l, h);
      this.buffer.positionsVBO = new Float32Array([
        p0[0], p0[1], p0[2], // bottom face
        p2[0], p2[1], p2[2],
        p1[0], p1[1], p1[2],
        p0[0], p0[1], p0[2],
        p3[0], p3[1], p3[2],
        p2[0], p2[1], p2[2],
        
        p4[0], p4[1], p4[2], // top face
        p5[0], p5[1], p5[2],
        p6[0], p6[1], p6[2],
        p4[0], p4[1], p4[2],
        p6[0], p6[1], p6[2],
        p7[0], p7[1], p7[2],

        p3[0], p3[1], p3[2], // left face
        p0[0], p0[1], p0[2],
        p4[0], p4[1], p4[2],
        p3[0], p3[1], p3[2],
        p4[0], p4[1], p4[2],
        p7[0], p7[1], p7[2],

        p1[0], p1[1], p1[2], // right face
        p2[0], p2[1], p2[2],
        p6[0], p6[1], p6[2],
        p1[0], p1[1], p1[2],
        p6[0], p6[1], p6[2],
        p5[0], p5[1], p5[2],

        p0[0], p0[1], p0[2], // forward Face
        p1[0], p1[1], p1[2],
        p5[0], p5[1], p5[2],
        p0[0], p0[1], p0[2],
        p5[0], p5[1], p5[2],
        p4[0], p4[1], p4[2],
        
        p2[0], p2[1], p2[2], // backward Face
        p3[0], p3[1], p3[2],
        p7[0], p7[1], p7[2],
        p2[0], p2[1], p2[2],
        p7[0], p7[1], p7[2],
        p6[0], p6[1], p6[2],

        // p1[0], p1[1], p1[2],
        // p2[0], p2[1], p2[2],
        // p3[0], p3[1], p3[2],
        // p4[0], p4[1], p4[2],
        // p5[0], p5[1], p5[2],
        // p6[0], p6[1], p6[2],
        // p7[0], p7[1], p7[2],
      ]);
      this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO); 

      let positionCount = this.buffer.positionsVBO.length/3;
      let indices = new Uint16Array(positionCount);
      this.buffer.indicesVBO = indices.map((obj, index) => {
        return index;
      });

      // this.buffer.indicesVBO = new Uint16Array([
      //   // bottom Face
      //   0, 1, 2,
      //   0, 2, 3,
      //   // Top Face
      //   4, 5, 6,
      //   4, 6 ,7,
      //   // Left Face
      //   3, 0 ,4,
      //   3, 4 ,7,
      //   // Right Face
      //   1, 2, 6,
      //   1, 6, 5,
      //   // Forward Face
      //   0, 1, 5,
      //   0, 5 ,4,
      //   // Backward Face
      //   2, 3, 7,
      //   2, 7, 6
      // ]);
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
      this.buffer.indicesLength = this.buffer.indicesVBO.length;
    }
    return this.buffer;
  }

  toRadian(degree) {
    return degree * Math.PI / 180;
  }
}