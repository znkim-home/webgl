export default class Camera {
  constructor() {
    const vec3 = self.glMatrix.vec3;
    this.pos = vec3.fromValues(0, 0, 0); //xyz
    this.dir = vec3.fromValues(0, 0, -1);
    this.up = vec3.fromValues(0, 1, 0);
    this.right = vec3.fromValues(1, 0, 0);
    this.heading = 0;
    this.pitch = 0;
    this.roll = 0;
    this.getTransformMatrix(true);
  }

  rotate(heading, pitch, roll) {
    this.heading += heading;
    this.pitch += pitch;
    this.roll += roll;

    const mat4 = self.glMatrix.mat4;

    let resultMatrix = mat4.create();
    mat4.identity(resultMatrix);
    
    let headingMatrix = mat4.create();
    mat4.identity(headingMatrix);
    mat4.rotate(headingMatrix, headingMatrix, this.toRadian(this.heading), this.up);

    let pitchMatrix = mat4.create();
    mat4.identity(pitchMatrix);
    mat4.rotate(pitchMatrix, pitchMatrix, this.toRadian(this.pitch), this.right);

    let rollMatrix = mat4.create();
    mat4.identity(rollMatrix);
    mat4.rotate(rollMatrix, rollMatrix, this.toRadian(this.roll), this.dir);

    mat4.multiply(resultMatrix, pitchMatrix, resultMatrix);
    mat4.multiply(resultMatrix, headingMatrix, resultMatrix);
    mat4.multiply(resultMatrix, rollMatrix, resultMatrix);
    let tm = this.getTransformMatrix(true);
    mat4.multiply(tm, tm, resultMatrix);
  }
  moveForward(factor) {
    const mat4 = self.glMatrix.mat4;
    let moveMatrix = mat4.create();
    mat4.identity(moveMatrix);
    mat4.translate(moveMatrix, moveMatrix, [0, 0, factor]);
    mat4.multiply(this.tm, this.tm, moveMatrix);
    this.setPositionSync();
  }
  moveRight(factor) {
    const mat4 = self.glMatrix.mat4;
    let moveMatrix = mat4.create();
    mat4.identity(moveMatrix);
    mat4.translate(moveMatrix, moveMatrix, [factor, 0, 0]);
    mat4.multiply(this.tm, this.tm, moveMatrix);
    this.setPositionSync();
  }
  moveUp(factor) {
    const mat4 = self.glMatrix.mat4;
    let moveMatrix = mat4.create();
    mat4.identity(moveMatrix);
    mat4.translate(moveMatrix, moveMatrix, [0, factor, 0]);
    mat4.multiply(this.tm, this.tm, moveMatrix);
    this.setPositionSync();
  }
  setPositionSync() {
    this.pos[0] = this.tm[12];
    this.pos[1] = this.tm[13];
    this.pos[2] = this.tm[14];
  }
  translate(x, y, z) {
    this.pos[0] += x;
    this.pos[1] += y;
    this.pos[2] += z;
    this.getTransformMatrix(true);
  }
  setPosition(x, y, z) {
    this.pos[0] = x;
    this.pos[1] = y;
    this.pos[2] = z;
    this.getTransformMatrix(true);
  }
  getModelViewMatrix() {
    const mat4 = self.glMatrix.mat4;
    let tm = this.getTransformMatrix();
    let mvm = mat4.create();
    mat4.invert(mvm, tm);
    return mvm;
  }
  getTransformMatrix(dirty = false) {
    const mat4 = self.glMatrix.mat4;
    if (!this.tm || dirty) {
      this.tm = mat4.fromValues(
        this.right[0], this.right[1], this.right[2], 0, 
        this.up[0], this.up[1], this.up[2], 0, 
        -this.dir[0], -this.dir[1], -this.dir[2], 0, 
        this.pos[0], this.pos[1], this.pos[2], 1);
    }
    return this.tm;
  }
  toRadian(degree) {
    return degree * Math.PI / 180;
  }
  toDegree(radian) {
    return radian * 180 / Math.PI;
  }
}