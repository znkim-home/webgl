import Buffer from './Buffer.js';
import Renderable from './abstract/Renderable';
const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Cube extends Renderable {
  pos;
  rot;
  size;
  buffer;

  constructor(options) {
    super();
    this.init(options);
  }
  
  init(options) {
    this.pos = vec3.fromValues(0, 0, 0); // position : x, y z
    this.rot = vec3.fromValues(0, 0, 0); // rotation : pitch, roll, heading
    this.size = vec3.fromValues(4, 6, 8); // size : width, length, height
    this.buffer = undefined;
    this.color = vec4.fromValues(0.5, 0.5, 0.50, 1); 

    if (options?.position) {
      this.pos = vec3.set(this.pos, options.position.x, options.position.y, options.position.z);
    }
    if (options?.size) {
      this.size = vec3.set(this.size, options.size.width, options.size.length, options.size.height);
    }
    if (options?.rotation) {
      this.rot = vec3.set(this.rot, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    }
    if (options?.color) {
      this.color = vec4.set(this.color, options?.color.r,options?.color.g, options?.color.b, options?.color.a);
    }
  }
  // overriding
  render(gl, shaderInfo) {
    let tm = this.getTransformMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);

    let buffer = this.getBuffer(gl, shaderInfo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);

    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
    gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);

    buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
    buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
    buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);

    gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);//
  }

  getTransformMatrix() {
    let tm = mat4.create();
    mat4.identity(tm);
    mat4.rotate(tm, tm, Math.radian(this.rot[0]), vec3.fromValues(1, 0, 0));
    mat4.rotate(tm, tm, Math.radian(this.rot[1]), vec3.fromValues(0, 1, 0));
    mat4.rotate(tm, tm, Math.radian(this.rot[2]), vec3.fromValues(0, 0, 1));
    tm[12] = this.pos[0];
    tm[13] = this.pos[1];
    tm[14] = this.pos[2];
    return tm;
  }

  calcNormal(pa, pb, pc) { // cc
    let d0 = vec3.fromValues(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]);
    let d1 = vec3.fromValues(pc[0] - pb[0], pc[1] - pb[1], pc[2] - pb[2]);
    let normal = vec3.create();
    vec3.cross(normal, d0, d1);
    vec3.normalize(normal, normal);
    return normal;
  }

  getBuffer(gl) {
    if (this.buffer === undefined) {
      this.buffer = new Buffer(gl);
      let w = this.size[0]/2;
      let l = this.size[1]/2;
      let h = this.size[2];

      let color = this.color;
      
      this.buffer.colorVBO = new Float32Array([
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],

        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],

        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],

        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],

        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],

        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
        color[0], color[1], color[2], color[3],
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

      let n0 = this.calcNormal(p0, p2, p1);
      let n1 = this.calcNormal(p0, p3, p2);
      let n2 = this.calcNormal(p4, p5, p6);
      let n3 = this.calcNormal(p4, p6, p7);
      let n4 = this.calcNormal(p3, p0, p4);
      let n5 = this.calcNormal(p3, p4, p7);
      let n6 = this.calcNormal(p1, p2, p6);
      let n7 = this.calcNormal(p1, p6, p5);
      let n8 = this.calcNormal(p0, p1, p5);
      let n9 = this.calcNormal(p0, p5, p4);
      let n10 = this.calcNormal(p2, p3, p7);
      let n11 = this.calcNormal(p2, p7, p6);

      this.buffer.normalVBO = new Float32Array([
        n0[0], n0[1], n0[2],
        n0[0], n0[1], n0[2],
        n0[0], n0[1], n0[2],

        n1[0], n1[1], n1[2],
        n1[0], n1[1], n1[2],
        n1[0], n1[1], n1[2],

        n2[0], n2[1], n2[2],
        n2[0], n2[1], n2[2],
        n2[0], n2[1], n2[2],

        n3[0], n3[1], n3[2],
        n3[0], n3[1], n3[2],
        n3[0], n3[1], n3[2],

        n4[0], n4[1], n4[2],
        n4[0], n4[1], n4[2],
        n4[0], n4[1], n4[2],

        n5[0], n5[1], n5[2],
        n5[0], n5[1], n5[2],
        n5[0], n5[1], n5[2],

        n6[0], n6[1], n6[2],
        n6[0], n6[1], n6[2],
        n6[0], n6[1], n6[2],

        n7[0], n7[1], n7[2],
        n7[0], n7[1], n7[2],
        n7[0], n7[1], n7[2],

        n8[0], n8[1], n8[2],
        n8[0], n8[1], n8[2],
        n8[0], n8[1], n8[2],

        n9[0], n9[1], n9[2],
        n9[0], n9[1], n9[2],
        n9[0], n9[1], n9[2],

        n10[0], n10[1], n10[2],
        n10[0], n10[1], n10[2],
        n10[0], n10[1], n10[2],

        n11[0], n11[1], n11[2],
        n11[0], n11[1], n11[2],
        n11[0], n11[1], n11[2],
      ]);
      this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO); 

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
      ]);
      this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO); 

      let positionCount = this.buffer.positionsVBO.length/3;
      let indices = new Uint16Array(positionCount);
      this.buffer.indicesVBO = indices.map((obj, index) => {
        return index;
      });
      this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
      this.buffer.indicesLength = this.buffer.indicesVBO.length;
    }
    return this.buffer;
  }
}