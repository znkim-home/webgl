"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix"); // eslint-disable-line no-unused-vars
class Sun {
    constructor(options) {
        this.init(options);
        this.getTransformMatrix();
    }
    get transformMatrix() {
        return this.getTransformMatrix();
    }
    get modelViewMatrix() {
        return this.getModelViewMatrix();
    }
    get rotationMatrix() {
        return this.getRotationMatrix();
    }
    init(options) {
        this.position = gl_matrix_1.vec3.fromValues(0, 0, 0); // [x, y ,z]
        this.rotation = gl_matrix_1.vec3.fromValues(0, 0, 0); // [heading, pitch, roll]
        this.direction = gl_matrix_1.vec3.fromValues(0, 0, -1); // direction of camera
        this.up = gl_matrix_1.vec3.fromValues(0, 1, 0); // up of direction
        this.right = gl_matrix_1.vec3.fromValues(1, 0, 0); // right of direction
        if (options === null || options === void 0 ? void 0 : options.fovyDegree) {
            this.fovyDegree = options.fovyDegree;
            this.fovyRadian = Math.radian(options.fovyDegree);
        }
        if (options === null || options === void 0 ? void 0 : options.position) {
            this.position = gl_matrix_1.vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        }
        else {
            this.position = gl_matrix_1.vec3.set(this.position, 0, 0, 0);
        }
        if (options === null || options === void 0 ? void 0 : options.rotation) {
            this.rotation = gl_matrix_1.vec3.set(this.rotation, options.rotation.heading, options.rotation.pitch, options.rotation.roll);
        }
        else {
            this.rotation = gl_matrix_1.vec3.set(this.rotation, 0, 0, 0);
        }
        this.dirty = true;
    }
    moveCamera(cameraPosition, startPosition, endPosition) {
        let offsetPosition = gl_matrix_1.vec3.subtract(gl_matrix_1.vec3.create(), startPosition, endPosition);
        gl_matrix_1.vec3.add(this.position, cameraPosition, offsetPosition);
        this.dirty = true;
    }
    rotationOrbit(xValue, yValue, pivotPosition) {
        let pitchAxis = this.right;
        let headingMatrix = gl_matrix_1.mat4.fromZRotation(gl_matrix_1.mat4.create(), xValue);
        let pitchMatrix = gl_matrix_1.mat4.fromRotation(gl_matrix_1.mat4.create(), yValue, pitchAxis);
        let totalRotationMatrix = gl_matrix_1.mat4.multiply(gl_matrix_1.mat4.create(), headingMatrix, pitchMatrix);
        let translatedCameraPosition = gl_matrix_1.vec3.subtract(gl_matrix_1.vec3.create(), this.position, pivotPosition);
        let translatedCameraPositionVec4 = gl_matrix_1.vec4.fromValues(translatedCameraPosition[0], translatedCameraPosition[1], translatedCameraPosition[2], 1.0);
        let transformedCameraPosition = gl_matrix_1.vec4.transformMat4(gl_matrix_1.vec4.create(), translatedCameraPositionVec4, totalRotationMatrix);
        let transformedCameraPositionVec3 = gl_matrix_1.vec3.fromValues(transformedCameraPosition[0], transformedCameraPosition[1], transformedCameraPosition[2]);
        let returnedCameraPosition = gl_matrix_1.vec3.add(gl_matrix_1.vec3.create(), transformedCameraPositionVec3, pivotPosition);
        this.position = returnedCameraPosition;
        let totalMatrix3 = gl_matrix_1.mat3.fromMat4(gl_matrix_1.mat3.create(), totalRotationMatrix);
        let rotatedDirection = gl_matrix_1.vec3.transformMat3(gl_matrix_1.vec3.create(), this.direction, totalMatrix3);
        this.direction = rotatedDirection;
        let rotatedUp = gl_matrix_1.vec3.transformMat3(gl_matrix_1.vec3.create(), this.up, totalMatrix3);
        this.up = rotatedUp;
        this.dirty = true;
    }
    rotate(heading, pitch, roll) {
        this.rotation[0] += heading;
        this.rotation[1] += pitch;
        this.rotation[2] += roll;
        let headingMatrix = gl_matrix_1.mat4.identity(gl_matrix_1.mat4.create());
        gl_matrix_1.mat4.rotate(headingMatrix, headingMatrix, Math.radian(this.rotation[0]), [0, 1, 0]);
        let rollMatrix = gl_matrix_1.mat4.identity(gl_matrix_1.mat4.create());
        gl_matrix_1.mat4.rotate(rollMatrix, rollMatrix, Math.radian(this.rotation[2]), [0, 0, -1]);
        let pitchMatrix = gl_matrix_1.mat4.identity(gl_matrix_1.mat4.create());
        gl_matrix_1.mat4.rotate(pitchMatrix, pitchMatrix, Math.radian(this.rotation[1]), [1, 0, 0]);
        let totalRotationMatrix = gl_matrix_1.mat4.identity(gl_matrix_1.mat4.create());
        gl_matrix_1.mat4.multiply(totalRotationMatrix, totalRotationMatrix, headingMatrix);
        gl_matrix_1.mat4.multiply(totalRotationMatrix, totalRotationMatrix, rollMatrix);
        gl_matrix_1.mat4.multiply(totalRotationMatrix, totalRotationMatrix, pitchMatrix);
        let totalMatrix3 = gl_matrix_1.mat3.fromMat4(gl_matrix_1.mat3.create(), totalRotationMatrix);
        let rotatedDirection = gl_matrix_1.vec3.transformMat3(gl_matrix_1.vec3.create(), [0, 0, -1], totalMatrix3);
        this.direction = rotatedDirection;
        let rotatedUp = gl_matrix_1.vec3.transformMat3(gl_matrix_1.vec3.create(), [0, 1, 0], totalMatrix3);
        this.up = rotatedUp;
        this.dirty = true;
    }
    lookAt(target) {
        let zAxis = gl_matrix_1.vec3.normalize(gl_matrix_1.vec3.create(), gl_matrix_1.vec3.subtract(gl_matrix_1.vec3.create(), this.position, target));
        let xAxis = gl_matrix_1.vec3.normalize(gl_matrix_1.vec3.create(), gl_matrix_1.vec3.cross(gl_matrix_1.vec3.create(), this.up, zAxis));
        let yAxis = gl_matrix_1.vec3.normalize(gl_matrix_1.vec3.create(), gl_matrix_1.vec3.cross(gl_matrix_1.vec3.create(), zAxis, xAxis));
        let result = gl_matrix_1.mat4.fromValues(xAxis[0], xAxis[1], xAxis[2], 0, yAxis[0], yAxis[1], yAxis[2], 0, zAxis[0], zAxis[1], zAxis[2], 0, this.position[0], this.position[1], this.position[2], 1);
        this._transformMatrix = result;
        return result;
    }
    moveForward(factor) {
        let moveMatrix = gl_matrix_1.mat4.create();
        gl_matrix_1.mat4.identity(moveMatrix);
        gl_matrix_1.mat4.translate(moveMatrix, moveMatrix, [0, 0, factor]);
        gl_matrix_1.mat4.multiply(this.transformMatrix, this.transformMatrix, moveMatrix);
        this.setPositionSync();
    }
    moveRight(factor) {
        let moveMatrix = gl_matrix_1.mat4.create();
        gl_matrix_1.mat4.identity(moveMatrix);
        gl_matrix_1.mat4.translate(moveMatrix, moveMatrix, [factor, 0, 0]);
        gl_matrix_1.mat4.multiply(this.transformMatrix, this.transformMatrix, moveMatrix);
        this.setPositionSync();
    }
    moveUp(factor) {
        let moveMatrix = gl_matrix_1.mat4.create();
        gl_matrix_1.mat4.identity(moveMatrix);
        gl_matrix_1.mat4.translate(moveMatrix, moveMatrix, [0, factor, 0]);
        gl_matrix_1.mat4.multiply(this.transformMatrix, this.transformMatrix, moveMatrix);
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
        if (!this._modelViewMatrix || this.dirty) {
            let transformMatrix = this.getTransformMatrix();
            let mvm = gl_matrix_1.mat4.create();
            this._modelViewMatrix = gl_matrix_1.mat4.invert(mvm, transformMatrix);
        }
        return this._modelViewMatrix;
    }
    getTransformMatrix() {
        if (!this._transformMatrix || this.dirty) {
            this.calcRight();
            this._transformMatrix = gl_matrix_1.mat4.fromValues(this.right[0], this.right[1], this.right[2], 0, this.up[0], this.up[1], this.up[2], 0, -this.direction[0], -this.direction[1], -this.direction[2], 0, this.position[0], this.position[1], this.position[2], 1);
        }
        return this._transformMatrix;
    }
    calcRight() {
        this.right = gl_matrix_1.vec3.cross(this.right, this.direction, this.up);
    }
    getRotationMatrix() {
        if (!this._rotationMatrix || this.dirty) {
            let transformMatrix = this.getTransformMatrix();
            this._rotationMatrix = gl_matrix_1.mat4.clone(transformMatrix);
            this._rotationMatrix[12] = 0;
            this._rotationMatrix[13] = 0;
            this._rotationMatrix[14] = 0;
        }
        return this._rotationMatrix;
    }
    getNormalMatrix() {
        let normalMatrix4 = gl_matrix_1.mat4.create();
        let modelViewMatrixInv = this.getModelViewMatrix();
        gl_matrix_1.mat4.invert(modelViewMatrixInv, modelViewMatrixInv);
        gl_matrix_1.mat4.transpose(normalMatrix4, modelViewMatrixInv);
        normalMatrix4[3] = 0.0;
        normalMatrix4[7] = 0.0;
        normalMatrix4[11] = 0.0;
        return normalMatrix4;
    }
    getViewRay(tc, relFar) {
        const fovy = Math.radian(this.fovyDegree);
        let aspectRatio = tc.width / tc.height;
        let tangentOfHalfFovy = Math.tan(fovy / 2);
        let hfar = 2.0 * tangentOfHalfFovy * relFar;
        let wfar = hfar * aspectRatio;
        let ray = gl_matrix_1.vec3.fromValues(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -relFar);
        return ray;
    }
}
exports.default = Sun;
