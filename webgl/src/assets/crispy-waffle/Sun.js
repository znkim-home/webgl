import { mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
export default class Sun {
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
        this.radius = 0;
        this.position = vec3.fromValues(0, 0, 0); // [x, y ,z]
        this.rotation = vec3.fromValues(0, 0, 0); // [heading, pitch, roll]
        this.direction = vec3.fromValues(0, 0, -1); // direction of camera
        this.up = vec3.fromValues(0, 1, 0); // up of direction
        this.right = vec3.fromValues(1, 0, 0); // right of direction
        if (options === null || options === void 0 ? void 0 : options.radius) {
            this.radius = options.radius;
        }
        if (options === null || options === void 0 ? void 0 : options.fovyDegree) {
            this.fovyDegree = options.fovyDegree;
            this.fovyRadian = Math.radian(options.fovyDegree);
        }
        if (options === null || options === void 0 ? void 0 : options.position) {
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        }
        else {
            this.position = vec3.set(this.position, 0, 0, 0);
        }
        if (options === null || options === void 0 ? void 0 : options.rotation) {
            this.rotation = vec3.set(this.rotation, options.rotation.heading, options.rotation.pitch, options.rotation.roll);
        }
        else {
            this.rotation = vec3.set(this.rotation, 0, 0, 0);
        }
        this.dirty = true;
    }
    moveCamera(cameraPosition, startPosition, endPosition) {
        let offsetPosition = vec3.subtract(vec3.create(), startPosition, endPosition);
        vec3.add(this.position, cameraPosition, offsetPosition);
        this.dirty = true;
    }
    rotationOrbit(xValue, yValue, pivotPosition) {
        let pitchAxis = this.right;
        let headingMatrix = mat4.fromZRotation(mat4.create(), xValue);
        let pitchMatrix = mat4.fromRotation(mat4.create(), yValue, pitchAxis);
        let totalRotationMatrix = mat4.multiply(mat4.create(), headingMatrix, pitchMatrix);
        let translatedCameraPosition = vec3.subtract(vec3.create(), this.position, pivotPosition);
        let translatedCameraPositionVec4 = vec4.fromValues(translatedCameraPosition[0], translatedCameraPosition[1], translatedCameraPosition[2], 1.0);
        let transformedCameraPosition = vec4.transformMat4(vec4.create(), translatedCameraPositionVec4, totalRotationMatrix);
        let transformedCameraPositionVec3 = vec3.fromValues(transformedCameraPosition[0], transformedCameraPosition[1], transformedCameraPosition[2]);
        let returnedCameraPosition = vec3.add(vec3.create(), transformedCameraPositionVec3, pivotPosition);
        this.position = returnedCameraPosition;
        let totalMatrix3 = mat3.fromMat4(mat3.create(), totalRotationMatrix);
        let rotatedDirection = vec3.transformMat3(vec3.create(), this.direction, totalMatrix3);
        this.direction = rotatedDirection;
        let rotatedUp = vec3.transformMat3(vec3.create(), this.up, totalMatrix3);
        this.up = rotatedUp;
        this.dirty = true;
    }
    rotate(heading, pitch, roll) {
        this.rotation[0] += heading;
        this.rotation[1] += pitch;
        this.rotation[2] += roll;
        let headingMatrix = mat4.identity(mat4.create());
        mat4.rotate(headingMatrix, headingMatrix, Math.radian(this.rotation[0]), [0, 1, 0]);
        let rollMatrix = mat4.identity(mat4.create());
        mat4.rotate(rollMatrix, rollMatrix, Math.radian(this.rotation[2]), [0, 0, -1]);
        let pitchMatrix = mat4.identity(mat4.create());
        mat4.rotate(pitchMatrix, pitchMatrix, Math.radian(this.rotation[1]), [1, 0, 0]);
        let totalRotationMatrix = mat4.identity(mat4.create());
        mat4.multiply(totalRotationMatrix, totalRotationMatrix, headingMatrix);
        mat4.multiply(totalRotationMatrix, totalRotationMatrix, rollMatrix);
        mat4.multiply(totalRotationMatrix, totalRotationMatrix, pitchMatrix);
        let totalMatrix3 = mat3.fromMat4(mat3.create(), totalRotationMatrix);
        let rotatedDirection = vec3.transformMat3(vec3.create(), [0, 0, -1], totalMatrix3);
        this.direction = rotatedDirection;
        let rotatedUp = vec3.transformMat3(vec3.create(), [0, 1, 0], totalMatrix3);
        this.up = rotatedUp;
        this.dirty = true;
    }
    lookAt(target) {
        let zAxis = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), this.position, target));
        let xAxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.up, zAxis));
        let yAxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), zAxis, xAxis));
        let result = mat4.fromValues(xAxis[0], xAxis[1], xAxis[2], 0, yAxis[0], yAxis[1], yAxis[2], 0, zAxis[0], zAxis[1], zAxis[2], 0, this.position[0], this.position[1], this.position[2], 1);
        this._transformMatrix = result;
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
    setRadius(radius) {
        this.radius = radius;
        this.dirty = true;
    }
    getRadius() {
        return this.radius;
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
            let mvm = mat4.create();
            this._modelViewMatrix = mat4.invert(mvm, transformMatrix);
        }
        return this._modelViewMatrix;
    }
    getTransformMatrix() {
        if (!this._transformMatrix || this.dirty) {
            this.calcRight();
            this._transformMatrix = mat4.fromValues(this.right[0], this.right[1], this.right[2], 0, this.up[0], this.up[1], this.up[2], 0, -this.direction[0], -this.direction[1], -this.direction[2], 0, this.position[0], this.position[1], this.position[2], 1);
        }
        return this._transformMatrix;
    }
    calcRight() {
        this.right = vec3.cross(this.right, this.direction, this.up);
    }
    getRotationMatrix() {
        if (!this._rotationMatrix || this.dirty) {
            let transformMatrix = this.getTransformMatrix();
            this._rotationMatrix = mat4.clone(transformMatrix);
            this._rotationMatrix[12] = 0;
            this._rotationMatrix[13] = 0;
            this._rotationMatrix[14] = 0;
        }
        return this._rotationMatrix;
    }
    getNormalMatrix() {
        let normalMatrix4 = mat4.create();
        let modelViewMatrixInv = this.getModelViewMatrix();
        mat4.invert(modelViewMatrixInv, modelViewMatrixInv);
        mat4.transpose(normalMatrix4, modelViewMatrixInv);
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
        let ray = vec3.fromValues(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -relFar);
        return ray;
    }
    getPositionHighLow() {
        let doublePosition = this.position;
        let xHighLow = this.getDoubleToHighLow(doublePosition[0]);
        let yHighLow = this.getDoubleToHighLow(doublePosition[1]);
        let zHighLow = this.getDoubleToHighLow(doublePosition[2]);
        let positionHigh = vec3.fromValues(xHighLow[0], yHighLow[0], zHighLow[0]);
        let positionLow = vec3.fromValues(xHighLow[1], yHighLow[1], zHighLow[1]);
        return [positionHigh, positionLow];
    }
    getDoubleToHighLow(value) {
        let floatHigh = 0.0;
        let floatLow = 0.0;
        let double = 0.0;
        if (value >= 0.0) {
            double = Math.floor(value / 65536.0) * 65536.0;
            floatHigh = double;
            floatLow = value - double;
        }
        else {
            double = Math.floor(-value / 65536.0) * 65536.0;
            floatHigh = -double;
            floatLow = value + double;
        }
        return vec2.fromValues(floatHigh, floatLow);
    }
}
