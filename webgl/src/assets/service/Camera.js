const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Camera {
  pos;
  rot;
  dir;
  up;
  right;

  constructor(options) {
    this.init(options);
    this.getTransformMatrix(true);
  }

  init(options) {
    this.pos = vec3.fromValues(0, 0, 0); // [x, y ,z]
    this.rot = vec3.fromValues(0, 0, 0); // [heading, pitch, roll]
    this.dir = vec3.fromValues(0, 0, -1); // direction of camera
    this.up = vec3.fromValues(0, 1, 0); // up of direction
    this.right = vec3.fromValues(1, 0, 0); // right of direction
    if (options?.position) {
      this.pos = vec3.set(this.pos, options.position.x, options.position.y, options.position.z);
    }
    if (options?.rotation) {
      this.rot = vec3.set(this.pos, options.rotation.heading, options.rotation.pitch, options.rotation.roll);
    }
  }

  getNormalMatrix() {
    let normalMatrix4 = mat4.create();
    let modelViewMatrixInv = this.getModelViewMatrix();
    mat4.invert(modelViewMatrixInv, modelViewMatrixInv);
    mat4.transpose(normalMatrix4, modelViewMatrixInv);
    return normalMatrix4;
  }

  rotate(heading, pitch, roll) {
    this.rot[0] += heading;
    this.rot[1] += pitch;
    this.rot[2] += roll;

    let resultMatrix = mat4.create();
    mat4.identity(resultMatrix);
    
    let headingMatrix = mat4.create();
    mat4.identity(headingMatrix);
    mat4.rotate(headingMatrix, headingMatrix, Math.radian(this.rot[0]), this.up);

    let pitchMatrix = mat4.create();
    mat4.identity(pitchMatrix);
    mat4.rotate(pitchMatrix, pitchMatrix, Math.radian(this.rot[1]), this.right);

    let rollMatrix = mat4.create();
    mat4.identity(rollMatrix);
    mat4.rotate(rollMatrix, rollMatrix, Math.radian(this.rot[2]), this.dir);

    mat4.multiply(resultMatrix, pitchMatrix, resultMatrix);
    mat4.multiply(resultMatrix, headingMatrix, resultMatrix);
    mat4.multiply(resultMatrix, rollMatrix, resultMatrix);
    let tm = this.getTransformMatrix(true);
    mat4.multiply(tm, tm, resultMatrix);
  }
  moveForward(factor) {
    let moveMatrix = mat4.create();
    mat4.identity(moveMatrix);
    mat4.translate(moveMatrix, moveMatrix, [0, 0, factor]);
    mat4.multiply(this.tm, this.tm, moveMatrix);
    this.setPositionSync();
  }
  moveRight(factor) {
    let moveMatrix = mat4.create();
    mat4.identity(moveMatrix);
    mat4.translate(moveMatrix, moveMatrix, [factor, 0, 0]);
    mat4.multiply(this.tm, this.tm, moveMatrix);
    this.setPositionSync();
  }
  moveUp(factor) {
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
    let tm = this.getTransformMatrix();
    let mvm = mat4.create();
    mat4.invert(mvm, tm);
    return mvm;
  }
  getTransformMatrix(dirty = false) {
    if (!this.tm || dirty) {
      this.tm = mat4.fromValues(
        this.right[0], this.right[1], this.right[2], 0, 
        this.up[0], this.up[1], this.up[2], 0, 
        -this.dir[0], -this.dir[1], -this.dir[2], 0, 
        this.pos[0], this.pos[1], this.pos[2], 1);
    }
    return this.tm;
  }
}