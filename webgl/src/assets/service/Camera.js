export default class Camera {
  /*tm = undefined;

  pos = undefined;

  dir = undefined;
  up = undefined;
  right = undefined;

  heading = undefined*/
  constructor() {
    //const mat4 = self.glMatrix.mat4;
    const vec3 = self.glMatrix.vec3;
    this.pos = vec3.fromValues(0, 0, 0);
    this.dir = vec3.fromValues(0, 0, -1);
    this.up = vec3.fromValues(0, 1, 0);
    this.right = vec3.fromValues(1, 0, 0);

    this.heading = 0;
    this.pitch = 0;
    this.roll = 0;
    this.getTrasformMatrix();
  }

  rotate(heading, pitch, roll) {
    this.heading += heading;
    this.pitch += pitch;
    this.roll += roll;

    //const vec3 = self.glMatrix.vec3;
    const mat4 = self.glMatrix.mat4;

    let resultMatrix = mat4.create();
    mat4.identity(resultMatrix);
    let headingMatrix = mat4.create();
    mat4.identity(headingMatrix);
    mat4.rotate(headingMatrix, headingMatrix, this.toRadian(this.heading), this.up);

    let pitchMatrix = mat4.create();
    mat4.identity(pitchMatrix);
    mat4.rotate(pitchMatrix, pitchMatrix, this.toRadian(this.pitch), this.right);

    // let rollMatrix = mat4.create();
    // mat4.identity(rollMatrix);
    // mat4.rotate(rollMatrix, rollMatrix, this.toRadian(this.roll), this.dir);

    mat4.multiply(resultMatrix, pitchMatrix, resultMatrix);
    mat4.multiply(resultMatrix, headingMatrix, resultMatrix);
    this.tm = undefined;
    let tm = this.getTrasformMatrix();
    mat4.multiply(tm, tm, resultMatrix);
  }

  _testRotate() {

  }

  /*rotate(axis, angle) {
    const mat4 = self.glMatrix.mat4;
    let tm = this.getTrasformMatrix();
    mat4.rotate(this.tm, tm, this.toRadian(angle), axis);
    return this.tm;
  }*/

  translate(x, y, z) {
    this.pos[0] += x;
    this.pos[1] += y;
    this.pos[2] += z;
    this.tm = undefined;
  }

  setPosition(x, y, z) {
    this.pos[0] = x;
    this.pos[1] = y;
    this.pos[2] = z;
    this.tm = undefined;
  }

  getModelViewMatrix() {
    const mat4 = self.glMatrix.mat4;
    let mvm = mat4.create();
    let tm = this.getTrasformMatrix();
    return mat4.invert(mvm, tm);
  }

  getTrasformMatrix() {
    const mat4 = self.glMatrix.mat4;
    let tm = this.tm ? this.tm : mat4.fromValues(
      this.right[0], this.right[1], this.right[2], 0, 
      this.up[0], this.up[1], this.up[2], 0, 
      -this.dir[0], -this.dir[1], -this.dir[2], 0, 
      this.pos[0], this.pos[1], this.pos[2], 1);
    this.tm = tm;
    return tm;
  }

  toRadian(degree) {
    return degree * Math.PI / 180;
  }
}