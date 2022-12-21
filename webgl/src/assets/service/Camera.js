const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Camera {
  transformMatrix;
  modelViewMatrix;
  rotationMatrix;

  position;
  rotation;
  direction
  up;
  right;
  constructor(options) {
    this.init(options);
    this.getTransformMatrix();
  }
  get transformMatrix() {
    this.getTransformMatrix();
    return this.transformMatrix;
  }
  init(options) {
    this.position = vec3.fromValues(0, 0, 0); // [x, y ,z]
    this.rotation = vec3.fromValues(0, 0, 0); // [heading, pitch, roll]
    this.direction = vec3.fromValues(0, 0, -1); // direction of camera
    this.up = vec3.fromValues(0, 1, 0); // up of direction
    this.right = vec3.fromValues(1, 0, 0); // right of direction
    if (options?.fovyDegree) {
      this.fovyDegree = options.fovyDegree;
    }
    if (options?.position) {
      this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    }
    if (options?.rotation) {
      this.rotation = vec3.set(this.position, options.rotation.heading, options.rotation.pitch, options.rotation.roll);
    }
  }
  moveCamera(startPosition, endPosition) {
    console.log(startPosition, endPosition);
  }
  // pivotPoint, heading, pitch
  rotationOrbit(xValue, yValue, pivotPosition) {
    let pitchAxis = this.right;
    let headingMatrix = mat4.fromZRotation(mat4.create(), xValue);
    let pitchMatrix = mat4.fromRotation(mat4.create(), yValue, pitchAxis);

    let totalRotationMatrix = mat4.multiply(mat4.create(), headingMatrix, pitchMatrix);

    let translatedCameraPosition = vec3.subtract(vec3.create(), this.position, pivotPosition);
    let translatedCameraPositionVec4 = vec4.fromValues(translatedCameraPosition[0], translatedCameraPosition[1], translatedCameraPosition[2], 1.0);
    let transformedCameraPosition = vec4.transformMat4(vec4.create(), translatedCameraPositionVec4, totalRotationMatrix);
    let transformedCameraPositionVec3 = vec3.fromValues(transformedCameraPosition[0], transformedCameraPosition[1], transformedCameraPosition[2]);
    let transformedAndReturnedCameraPosition = vec3.add(vec4.create(), transformedCameraPositionVec3, pivotPosition);

    this.position = transformedAndReturnedCameraPosition;
    
    let totalMatrix3 = mat3.fromMat4(mat3.create(), totalRotationMatrix);

    let rotatedDirection = vec3.transformMat3(vec3.create(), this.direction, totalMatrix3)
    this.direction = rotatedDirection;
    let rotatedUp = vec3.transformMat3(vec3.create(), this.up, totalMatrix3)
    this.up = rotatedUp;

    this.dirty = true;
  }
  rotate(heading, pitch, roll) {
    this.rotation[0] += heading;
    this.rotation[1] += pitch;
    this.rotation[2] += roll;

    let resultMatrix = mat4.identity(mat4.create()); 
    
    let headingMatrix = mat4.identity(mat4.create()); 
    mat4.rotate(headingMatrix, headingMatrix, Math.radian(this.rotation[0]), this.up);

    let pitchMatrix = mat4.identity(mat4.create()); 
    mat4.rotate(pitchMatrix, pitchMatrix, Math.radian(this.rotation[1]), this.right);

    let rollMatrix = mat4.identity(mat4.create()); 
    mat4.rotate(rollMatrix, rollMatrix, Math.radian(this.rotation[2]), this.direction);

    mat4.multiply(resultMatrix, pitchMatrix, resultMatrix);
    mat4.multiply(resultMatrix, headingMatrix, resultMatrix);
    mat4.multiply(resultMatrix, rollMatrix, resultMatrix);
    let transformMatrix = this.getTransformMatrix();
    //resultMatrix = mat4.invert(resultMatrix, resultMatrix); 
    mat4.multiply(transformMatrix, transformMatrix, resultMatrix);
  }
  lookAt(target) {
    let zAxis = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), this.position, target));
    let xAxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.up, zAxis));
    let yAxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), zAxis, xAxis));
    console.log(zAxis, xAxis, yAxis);
    let result = mat4.fromValues(
      xAxis[0], xAxis[1], xAxis[2], 0, 
      yAxis[0], yAxis[1], yAxis[2], 0, 
      zAxis[0], zAxis[1], zAxis[2], 0, 
      this.position[0], this.position[1], this.position[2], 1);
    this.transformMatrix = result;
    return result;
  }
  moveForward(factor) {
    let moveMatrix = mat4.create();
    mat4.identity(moveMatrix);
    mat4.translate(moveMatrix, moveMatrix, [0, 0, factor]);
    mat4.multiply(this.transformMatrix, this.transformMatrix, moveMatrix);
    this.setPositionSync();
  }
  moveRight(factor) {
    let moveMatrix = mat4.create();
    mat4.identity(moveMatrix);
    mat4.translate(moveMatrix, moveMatrix, [factor, 0, 0]);
    mat4.multiply(this.transformMatrix, this.transformMatrix, moveMatrix);
    this.setPositionSync();
  }
  moveUp(factor) {
    let moveMatrix = mat4.create();
    mat4.identity(moveMatrix);
    mat4.translate(moveMatrix, moveMatrix, [0, factor, 0]);
    mat4.multiply(this.transformMatrix, this.transformMatrix, moveMatrix);
    this.setPositionSync();
  }
  setPositionSync() {
    this.position[0] = this.transformMatrix[12];
    this.position[1] = this.transformMatrix[13];
    this.position[2] = this.transformMatrix[14];
  }
  setRotationSync() {
    this.right[0] = this.transformMatrix[0];
    this.right[1] = this.transformMatrix[1];
    this.right[2] = this.transformMatrix[2];
    this.up[0] = this.transformMatrix[4];
    this.up[1] = this.transformMatrix[5];
    this.up[2] = this.transformMatrix[6];
    this.direction[0] = -this.transformMatrix[8];
    this.direction[1] = -this.transformMatrix[9];
    this.direction[2] = -this.transformMatrix[10];
  }
  translate(x, y, z) {
    this.position[0] += x;
    this.position[1] += y;
    this.position[2] += z;
    this.dirty = true;
  }
  setPosition(x, y, z) {
    this.position[0] = x;
    this.position[1] = y;
    this.position[2] = z;
    this.dirty = true;
  }
  getModelViewMatrix() {
    let transformMatrix = this.getTransformMatrix();
    let mvm = mat4.create();
    mat4.invert(mvm, transformMatrix);
    return mvm;
  }
  getTransformMatrix() {
    if (!this.transformMatrix || this.dirty) {
      this.calcRight();
      this.transformMatrix = mat4.fromValues(
        this.right[0], this.right[1], this.right[2], 0, 
        this.up[0], this.up[1], this.up[2], 0, 
        -this.direction[0], -this.direction[1], -this.direction[2], 0, 
        this.position[0], this.position[1], this.position[2], 1);
    }
    return this.transformMatrix;
  }
  calcRight() {
    this.right = vec3.cross(this.right, this.direction, this.up);
  }
  getRotationMatrix() {
    this.rotationMatrix = mat4.clone(this.transformMatrix);
    this.rotationMatrix[12] = 0;
    this.rotationMatrix[13] = 0;
    this.rotationMatrix[14] = 0;
    return this.rotationMatrix;
  }
  getNormalMatrix() {
    let normalMatrix4 = mat4.create();
    let modelViewMatrixInv = this.getModelViewMatrix();
    mat4.invert(modelViewMatrixInv, modelViewMatrixInv);
    mat4.transpose(normalMatrix4, modelViewMatrixInv);
    return normalMatrix4;
  }
  getViewRay(tc, relFar) {
    const fovy = Math.radian(this.fovyDegree);
    let aspectRatio = tc.width / tc.height;
    let tangentOfHalfFovy = Math.tan(fovy / 2);

    let hfar = 2.0 * tangentOfHalfFovy * relFar;
    let wfar = hfar * aspectRatio;    
    let ray = vec3.fromValues(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -relFar);

    return ray;              
  }
}