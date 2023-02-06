import { vec3, mat4, vec4, mat3, vec2 } from 'gl-matrix';

var Shader = /** @class */ (function () {
    function Shader(gl) {
        this._gl = gl;
    }
    Object.defineProperty(Shader.prototype, "gl", {
        get: function () {
            return this._gl;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Shader.prototype, "shaderInfo", {
        get: function () {
            return this._shaderInfo;
        },
        enumerable: false,
        configurable: true
    });
    Shader.prototype.init = function (shaderObject) {
        var gl = this.gl;
        var vertexShader = this.createShader(gl.VERTEX_SHADER, shaderObject.vertexShaderSource);
        var fragmentShader = this.createShader(gl.FRAGMENT_SHADER, shaderObject.fragmentShaderSource);
        var shaderProgram = this.createShaderProgram(vertexShader, fragmentShader);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program.");
            return;
        }
        gl.useProgram(shaderProgram);
        var attributeLocations = {};
        shaderObject.attributes.forEach(function (attribute) {
            if (attribute[0] !== 'a') {
                throw new Error("Shader: attribute variable name is incorrect.");
            }
            var result = attribute.replace('a', '');
            result = result.replace(/^[A-Z]/, function (char) { return char.toLowerCase(); });
            attributeLocations[result] = gl.getAttribLocation(shaderProgram, attribute);
        });
        var uniformLocations = {};
        shaderObject.uniforms.forEach(function (uniform) {
            if (uniform[0] !== 'u') {
                throw new Error("Shader: uniform variable name is incorrect.");
            }
            var result = uniform.replace('u', '');
            result = result.replace(/^[A-Z]/, function (char) { return char.toLowerCase(); });
            uniformLocations[result] = gl.getUniformLocation(shaderProgram, uniform);
        });
        this._shaderInfo = {
            shaderProgram: shaderProgram,
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
            attributeLocations: attributeLocations,
            uniformLocations: uniformLocations,
        };
    };
    Shader.prototype.createShader = function (shaderType, shaderSource) {
        var gl = this.gl;
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!status) {
            var message = "An error occurred compiling the shaders:  ".concat(gl.getShaderInfoLog(shader));
            throw new Error(message);
        }
        return shader;
    };
    Shader.prototype.createShaderProgram = function (vertexShader, fragmentShader) {
        var gl = this.gl;
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        return shaderProgram;
    };
    Shader.prototype.useProgram = function () {
        this.gl.useProgram(this.shaderInfo.shaderProgram);
    };
    return Shader;
}());

var Camera = /** @class */ (function () {
    function Camera(options) {
        this.init(options);
        this.getTransformMatrix();
    }
    Object.defineProperty(Camera.prototype, "transformMatrix", {
        get: function () {
            return this.getTransformMatrix();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "modelViewMatrix", {
        get: function () {
            return this.getModelViewMatrix();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "rotationMatrix", {
        get: function () {
            return this.getRotationMatrix();
        },
        enumerable: false,
        configurable: true
    });
    Camera.prototype.init = function (options) {
        this.position = vec3.fromValues(0, 0, 0); // [x, y ,z]
        this.rotation = vec3.fromValues(0, 0, 0); // [heading, pitch, roll]
        this.direction = vec3.fromValues(0, 0, -1); // direction of camera
        this.up = vec3.fromValues(0, 1, 0); // up of direction
        this.right = vec3.fromValues(1, 0, 0); // right of direction
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
    };
    Camera.prototype.syncFovyDegree = function (fovyDegree) {
        if (fovyDegree === void 0) { fovyDegree = this.fovyDegree; }
        this.fovyDegree = fovyDegree;
        this.fovyRadian = Math.radian(this.fovyDegree);
    };
    Camera.prototype.moveCamera = function (cameraPosition, startPosition, endPosition) {
        var offsetPosition = vec3.subtract(vec3.create(), startPosition, endPosition);
        vec3.add(this.position, cameraPosition, offsetPosition);
        this.dirty = true;
    };
    Camera.prototype.rotationOrbit = function (xValue, yValue, pivotPosition) {
        var pitchAxis = this.right;
        var headingMatrix = mat4.fromZRotation(mat4.create(), xValue);
        var pitchMatrix = mat4.fromRotation(mat4.create(), yValue, pitchAxis);
        var totalRotationMatrix = mat4.multiply(mat4.create(), headingMatrix, pitchMatrix);
        var translatedCameraPosition = vec3.subtract(vec3.create(), this.position, pivotPosition);
        var translatedCameraPositionVec4 = vec4.fromValues(translatedCameraPosition[0], translatedCameraPosition[1], translatedCameraPosition[2], 1.0);
        var transformedCameraPosition = vec4.transformMat4(vec4.create(), translatedCameraPositionVec4, totalRotationMatrix);
        var transformedCameraPositionVec3 = vec3.fromValues(transformedCameraPosition[0], transformedCameraPosition[1], transformedCameraPosition[2]);
        var returnedCameraPosition = vec3.add(vec3.create(), transformedCameraPositionVec3, pivotPosition);
        this.position = returnedCameraPosition;
        var totalMatrix3 = mat3.fromMat4(mat3.create(), totalRotationMatrix);
        var rotatedDirection = vec3.transformMat3(vec3.create(), this.direction, totalMatrix3);
        this.direction = rotatedDirection;
        var rotatedUp = vec3.transformMat3(vec3.create(), this.up, totalMatrix3);
        this.up = rotatedUp;
        this.dirty = true;
    };
    Camera.prototype.rotate = function (heading, pitch, roll) {
        this.rotation[0] += heading;
        this.rotation[1] += pitch;
        this.rotation[2] += roll;
        var headingMatrix = mat4.identity(mat4.create());
        mat4.rotate(headingMatrix, headingMatrix, Math.radian(this.rotation[0]), [0, 1, 0]);
        var rollMatrix = mat4.identity(mat4.create());
        mat4.rotate(rollMatrix, rollMatrix, Math.radian(this.rotation[2]), [0, 0, -1]);
        var pitchMatrix = mat4.identity(mat4.create());
        mat4.rotate(pitchMatrix, pitchMatrix, Math.radian(this.rotation[1]), [1, 0, 0]);
        var totalRotationMatrix = mat4.identity(mat4.create());
        mat4.multiply(totalRotationMatrix, totalRotationMatrix, headingMatrix);
        mat4.multiply(totalRotationMatrix, totalRotationMatrix, rollMatrix);
        mat4.multiply(totalRotationMatrix, totalRotationMatrix, pitchMatrix);
        var totalMatrix3 = mat3.fromMat4(mat3.create(), totalRotationMatrix);
        var rotatedDirection = vec3.transformMat3(vec3.create(), [0, 0, -1], totalMatrix3);
        this.direction = rotatedDirection;
        var rotatedUp = vec3.transformMat3(vec3.create(), [0, 1, 0], totalMatrix3);
        this.up = rotatedUp;
        this.dirty = true;
    };
    Camera.prototype.lookAt = function (target) {
        var zAxis = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), this.position, target));
        var xAxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.up, zAxis));
        var yAxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), zAxis, xAxis));
        var result = mat4.fromValues(xAxis[0], xAxis[1], xAxis[2], 0, yAxis[0], yAxis[1], yAxis[2], 0, zAxis[0], zAxis[1], zAxis[2], 0, this.position[0], this.position[1], this.position[2], 1);
        this._transformMatrix = result;
        return result;
    };
    Camera.prototype.moveForward = function (factor) {
        var moveMatrix = mat4.create();
        mat4.identity(moveMatrix);
        mat4.translate(moveMatrix, moveMatrix, [0, 0, factor]);
        mat4.multiply(this._transformMatrix, this._transformMatrix, moveMatrix);
        this.setPositionSync();
    };
    Camera.prototype.moveRight = function (factor) {
        var moveMatrix = mat4.create();
        mat4.identity(moveMatrix);
        mat4.translate(moveMatrix, moveMatrix, [factor, 0, 0]);
        mat4.multiply(this._transformMatrix, this._transformMatrix, moveMatrix);
        this.setPositionSync();
    };
    Camera.prototype.moveUp = function (factor) {
        var moveMatrix = mat4.create();
        mat4.identity(moveMatrix);
        mat4.translate(moveMatrix, moveMatrix, [0, factor, 0]);
        mat4.multiply(this._transformMatrix, this._transformMatrix, moveMatrix);
        this.setPositionSync();
    };
    Camera.prototype.setPositionSync = function () {
        this.position[0] = this._transformMatrix[12];
        this.position[1] = this._transformMatrix[13];
        this.position[2] = this._transformMatrix[14];
    };
    Camera.prototype.setRotationSync = function () {
        this.right[0] = this._transformMatrix[0];
        this.right[1] = this._transformMatrix[1];
        this.right[2] = this._transformMatrix[2];
        this.up[0] = this._transformMatrix[4];
        this.up[1] = this._transformMatrix[5];
        this.up[2] = this._transformMatrix[6];
        this.direction[0] = -this._transformMatrix[8];
        this.direction[1] = -this._transformMatrix[9];
        this.direction[2] = -this._transformMatrix[10];
    };
    Camera.prototype.translate = function (x, y, z) {
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
        this.dirty = true;
    };
    Camera.prototype.setPosition = function (x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.dirty = true;
    };
    Camera.prototype.calcRight = function () {
        this.right = vec3.cross(this.right, this.direction, this.up);
    };
    Camera.prototype.getModelViewMatrix = function () {
        if (!this._modelViewMatrix || this.dirty) {
            var transformMatrix = this.getTransformMatrix();
            var mvm = mat4.create();
            this._modelViewMatrix = mat4.invert(mvm, transformMatrix);
        }
        return this._modelViewMatrix;
    };
    Camera.prototype.getTransformMatrix = function () {
        if (!this._transformMatrix || this.dirty) {
            this.calcRight();
            this._transformMatrix = mat4.fromValues(this.right[0], this.right[1], this.right[2], 0, this.up[0], this.up[1], this.up[2], 0, -this.direction[0], -this.direction[1], -this.direction[2], 0, this.position[0], this.position[1], this.position[2], 1);
        }
        return this._transformMatrix;
    };
    Camera.prototype.getRotationMatrix = function () {
        if (!this._rotationMatrix || this.dirty) {
            this.getTransformMatrix();
            this._rotationMatrix = mat4.clone(this._transformMatrix);
            this._rotationMatrix[12] = 0;
            this._rotationMatrix[13] = 0;
            this._rotationMatrix[14] = 0;
            return this._rotationMatrix;
        }
        return this._rotationMatrix;
    };
    Camera.prototype.getNormalMatrix = function () {
        var normalMatrix4 = mat4.create();
        var modelViewMatrixInv = this.getModelViewMatrix();
        mat4.invert(modelViewMatrixInv, modelViewMatrixInv);
        mat4.transpose(normalMatrix4, modelViewMatrixInv);
        normalMatrix4[3] = 0.0;
        normalMatrix4[7] = 0.0;
        normalMatrix4[11] = 0.0;
        return normalMatrix4;
    };
    Camera.prototype.getViewRay = function (tc, relFar) {
        if (relFar === void 0) { relFar = 1.0; }
        var fovy = Math.radian(this.fovyDegree);
        var aspectRatio = tc.width / tc.height;
        var tangentOfHalfFovy = Math.tan(fovy / 2);
        var hfar = 2.0 * tangentOfHalfFovy * relFar;
        var wfar = hfar * aspectRatio;
        var ray = vec3.fromValues(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -relFar);
        return ray;
    };
    return Camera;
}());

var Sun = /** @class */ (function () {
    function Sun(options) {
        this.init(options);
        this.getTransformMatrix();
    }
    Object.defineProperty(Sun.prototype, "transformMatrix", {
        get: function () {
            return this.getTransformMatrix();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sun.prototype, "modelViewMatrix", {
        get: function () {
            return this.getModelViewMatrix();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sun.prototype, "rotationMatrix", {
        get: function () {
            return this.getRotationMatrix();
        },
        enumerable: false,
        configurable: true
    });
    Sun.prototype.init = function (options) {
        this.position = vec3.fromValues(0, 0, 0); // [x, y ,z]
        this.rotation = vec3.fromValues(0, 0, 0); // [heading, pitch, roll]
        this.direction = vec3.fromValues(0, 0, -1); // direction of camera
        this.up = vec3.fromValues(0, 1, 0); // up of direction
        this.right = vec3.fromValues(1, 0, 0); // right of direction
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
    };
    Sun.prototype.moveCamera = function (cameraPosition, startPosition, endPosition) {
        var offsetPosition = vec3.subtract(vec3.create(), startPosition, endPosition);
        vec3.add(this.position, cameraPosition, offsetPosition);
        this.dirty = true;
    };
    Sun.prototype.rotationOrbit = function (xValue, yValue, pivotPosition) {
        var pitchAxis = this.right;
        var headingMatrix = mat4.fromZRotation(mat4.create(), xValue);
        var pitchMatrix = mat4.fromRotation(mat4.create(), yValue, pitchAxis);
        var totalRotationMatrix = mat4.multiply(mat4.create(), headingMatrix, pitchMatrix);
        var translatedCameraPosition = vec3.subtract(vec3.create(), this.position, pivotPosition);
        var translatedCameraPositionVec4 = vec4.fromValues(translatedCameraPosition[0], translatedCameraPosition[1], translatedCameraPosition[2], 1.0);
        var transformedCameraPosition = vec4.transformMat4(vec4.create(), translatedCameraPositionVec4, totalRotationMatrix);
        var transformedCameraPositionVec3 = vec3.fromValues(transformedCameraPosition[0], transformedCameraPosition[1], transformedCameraPosition[2]);
        var returnedCameraPosition = vec3.add(vec3.create(), transformedCameraPositionVec3, pivotPosition);
        this.position = returnedCameraPosition;
        var totalMatrix3 = mat3.fromMat4(mat3.create(), totalRotationMatrix);
        var rotatedDirection = vec3.transformMat3(vec3.create(), this.direction, totalMatrix3);
        this.direction = rotatedDirection;
        var rotatedUp = vec3.transformMat3(vec3.create(), this.up, totalMatrix3);
        this.up = rotatedUp;
        this.dirty = true;
    };
    Sun.prototype.rotate = function (heading, pitch, roll) {
        this.rotation[0] += heading;
        this.rotation[1] += pitch;
        this.rotation[2] += roll;
        var headingMatrix = mat4.identity(mat4.create());
        mat4.rotate(headingMatrix, headingMatrix, Math.radian(this.rotation[0]), [0, 1, 0]);
        var rollMatrix = mat4.identity(mat4.create());
        mat4.rotate(rollMatrix, rollMatrix, Math.radian(this.rotation[2]), [0, 0, -1]);
        var pitchMatrix = mat4.identity(mat4.create());
        mat4.rotate(pitchMatrix, pitchMatrix, Math.radian(this.rotation[1]), [1, 0, 0]);
        var totalRotationMatrix = mat4.identity(mat4.create());
        mat4.multiply(totalRotationMatrix, totalRotationMatrix, headingMatrix);
        mat4.multiply(totalRotationMatrix, totalRotationMatrix, rollMatrix);
        mat4.multiply(totalRotationMatrix, totalRotationMatrix, pitchMatrix);
        var totalMatrix3 = mat3.fromMat4(mat3.create(), totalRotationMatrix);
        var rotatedDirection = vec3.transformMat3(vec3.create(), [0, 0, -1], totalMatrix3);
        this.direction = rotatedDirection;
        var rotatedUp = vec3.transformMat3(vec3.create(), [0, 1, 0], totalMatrix3);
        this.up = rotatedUp;
        this.dirty = true;
    };
    Sun.prototype.lookAt = function (target) {
        var zAxis = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), this.position, target));
        var xAxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.up, zAxis));
        var yAxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), zAxis, xAxis));
        var result = mat4.fromValues(xAxis[0], xAxis[1], xAxis[2], 0, yAxis[0], yAxis[1], yAxis[2], 0, zAxis[0], zAxis[1], zAxis[2], 0, this.position[0], this.position[1], this.position[2], 1);
        this._transformMatrix = result;
        return result;
    };
    Sun.prototype.moveForward = function (factor) {
        var moveMatrix = mat4.create();
        mat4.identity(moveMatrix);
        mat4.translate(moveMatrix, moveMatrix, [0, 0, factor]);
        mat4.multiply(this.transformMatrix, this.transformMatrix, moveMatrix);
        this.setPositionSync();
    };
    Sun.prototype.moveRight = function (factor) {
        var moveMatrix = mat4.create();
        mat4.identity(moveMatrix);
        mat4.translate(moveMatrix, moveMatrix, [factor, 0, 0]);
        mat4.multiply(this.transformMatrix, this.transformMatrix, moveMatrix);
        this.setPositionSync();
    };
    Sun.prototype.moveUp = function (factor) {
        var moveMatrix = mat4.create();
        mat4.identity(moveMatrix);
        mat4.translate(moveMatrix, moveMatrix, [0, factor, 0]);
        mat4.multiply(this.transformMatrix, this.transformMatrix, moveMatrix);
        this.setPositionSync();
    };
    Sun.prototype.setPositionSync = function () {
        this.position[0] = this.transformMatrix[12];
        this.position[1] = this.transformMatrix[13];
        this.position[2] = this.transformMatrix[14];
    };
    Sun.prototype.setRotationSync = function () {
        this.right[0] = this.transformMatrix[0];
        this.right[1] = this.transformMatrix[1];
        this.right[2] = this.transformMatrix[2];
        this.up[0] = this.transformMatrix[4];
        this.up[1] = this.transformMatrix[5];
        this.up[2] = this.transformMatrix[6];
        this.direction[0] = -this.transformMatrix[8];
        this.direction[1] = -this.transformMatrix[9];
        this.direction[2] = -this.transformMatrix[10];
    };
    Sun.prototype.translate = function (x, y, z) {
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
        this.dirty = true;
    };
    Sun.prototype.setPosition = function (x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.dirty = true;
    };
    Sun.prototype.getModelViewMatrix = function () {
        if (!this._modelViewMatrix || this.dirty) {
            var transformMatrix = this.getTransformMatrix();
            var mvm = mat4.create();
            this._modelViewMatrix = mat4.invert(mvm, transformMatrix);
        }
        return this._modelViewMatrix;
    };
    Sun.prototype.getTransformMatrix = function () {
        if (!this._transformMatrix || this.dirty) {
            this.calcRight();
            this._transformMatrix = mat4.fromValues(this.right[0], this.right[1], this.right[2], 0, this.up[0], this.up[1], this.up[2], 0, -this.direction[0], -this.direction[1], -this.direction[2], 0, this.position[0], this.position[1], this.position[2], 1);
        }
        return this._transformMatrix;
    };
    Sun.prototype.calcRight = function () {
        this.right = vec3.cross(this.right, this.direction, this.up);
    };
    Sun.prototype.getRotationMatrix = function () {
        if (!this._rotationMatrix || this.dirty) {
            var transformMatrix = this.getTransformMatrix();
            this._rotationMatrix = mat4.clone(transformMatrix);
            this._rotationMatrix[12] = 0;
            this._rotationMatrix[13] = 0;
            this._rotationMatrix[14] = 0;
        }
        return this._rotationMatrix;
    };
    Sun.prototype.getNormalMatrix = function () {
        var normalMatrix4 = mat4.create();
        var modelViewMatrixInv = this.getModelViewMatrix();
        mat4.invert(modelViewMatrixInv, modelViewMatrixInv);
        mat4.transpose(normalMatrix4, modelViewMatrixInv);
        normalMatrix4[3] = 0.0;
        normalMatrix4[7] = 0.0;
        normalMatrix4[11] = 0.0;
        return normalMatrix4;
    };
    Sun.prototype.getViewRay = function (tc, relFar) {
        var fovy = Math.radian(this.fovyDegree);
        var aspectRatio = tc.width / tc.height;
        var tangentOfHalfFovy = Math.tan(fovy / 2);
        var hfar = 2.0 * tangentOfHalfFovy * relFar;
        var wfar = hfar * aspectRatio;
        var ray = vec3.fromValues(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -relFar);
        return ray;
    };
    return Sun;
}());

var FrameBufferObject = /** @class */ (function () {
    /**
     * constructor
     * @param {*} gl
     * @param {*} options
     */
    function FrameBufferObject(gl, canvas, shaderInfo, options, globalOptions) {
        this.gl = gl;
        this.canvas = canvas;
        this.shaderInfo = shaderInfo;
        this.frameBuffer = gl.createFramebuffer();
        this.renderBuffer = gl.createRenderbuffer();
        this.texture = gl.createTexture();
        this.options = options;
        this.globalOptions = globalOptions;
        this.init();
    }
    FrameBufferObject.prototype.init = function () {
        var _a, _b, _c, _d, _e;
        var gl = this.gl;
        var canvas = this.canvas;
        this.textureType = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.textureType) ? this.options.textureType : 0;
        this.clearColor = ((_b = this.options) === null || _b === void 0 ? void 0 : _b.clearColor) ? this.options.clearColor : vec3.fromValues(1.0, 1.0, 1.0);
        this.name = ((_c = this.options) === null || _c === void 0 ? void 0 : _c.name) ? this.options.name : "Untitled FrameBuffer";
        this.widths = new Int32Array([((_d = this.options) === null || _d === void 0 ? void 0 : _d.width) ? this.options.width : canvas.width]);
        this.heights = new Int32Array([((_e = this.options) === null || _e === void 0 ? void 0 : _e.height) ? this.options.height : canvas.height]);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.widths[0], this.heights[0], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.widths[0], this.heights[0]);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error("Incomplete frame buffer object.");
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    FrameBufferObject.prototype.clear = function () {
        var gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    FrameBufferObject.prototype.bind = function (shaderInfo) {
        if (shaderInfo === void 0) { shaderInfo = this.shaderInfo; }
        var gl = this.gl;
        gl.uniform1i(shaderInfo.uniformLocations.textureType, this.textureType);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    };
    FrameBufferObject.prototype.unbind = function () {
        var gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    FrameBufferObject.prototype.getNormal = function (x, y) {
        var gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        var pixels = new Uint8Array(4);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        var pixelsF32 = new Float32Array([pixels[0] / 255.0, pixels[1] / 255.0, pixels[2] / 255.0, pixels[3] / 255.0]);
        return this.decodeNormal(pixelsF32);
    };
    FrameBufferObject.prototype.getColor = function (x, y) {
        var gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        var pixels = new Uint8Array(4);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return this.convertColorToId(pixels);
    };
    FrameBufferObject.prototype.getDepth = function (x, y) {
        var gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        var pixels = new Uint8Array(4);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        var pixelsF32 = new Float32Array([pixels[0] / 255.0, pixels[1] / 255.0, pixels[2] / 255.0, pixels[3] / 255.0]);
        var result = this.unpackDepth(pixelsF32) * this.globalOptions.far;
        return result;
    };
    FrameBufferObject.prototype.convertIdToColor = function (id) {
        var calc = function (value, div) { return Math.floor(value / div) % 256 / 255; };
        return vec4.fromValues(calc(id, 16777216), calc(id, 65536), calc(id, 256), calc(id, 1));
    };
    FrameBufferObject.prototype.convertColorToId = function (color) {
        return (color[0] * 16777216) + (color[1] * 65536) + (color[2] * 256) + (color[3]);
    };
    FrameBufferObject.prototype.convertColor255ToId = function (color) {
        return (color[0] * 16777216 * 255) + (color[1] * 65536 * 255) + (color[2] * 256 * 255) + (color[3] * 255);
    };
    FrameBufferObject.prototype.unpackDepth = function (rgba_depth) {
        return rgba_depth[0] + rgba_depth[1] * 1.0 / 255.0 + rgba_depth[2] * 1.0 / 65025.0 + rgba_depth[3] * 1.0 / 16581375.0;
    };
    FrameBufferObject.prototype.decodeNormal = function (normal) {
        var result = vec3.fromValues(normal[0] * 2.0 - 1.0, normal[1] * 2.0 - 1.0, normal[2] * 2.0 - 1.0);
        vec3.normalize(result, result);
        return result;
    };
    return FrameBufferObject;
}());

var RenderableObjectList = /** @class */ (function () {
    function RenderableObjectList() {
        this.init();
    }
    RenderableObjectList.prototype.init = function () {
        this.renderableObjects = [];
    };
    RenderableObjectList.prototype.findById = function (id) {
        return this.renderableObjects.find(function (renderableObject) {
            return renderableObject.id === id;
        });
    };
    RenderableObjectList.prototype.set = function (renderableObjects) {
        this.renderableObjects = renderableObjects;
    };
    RenderableObjectList.prototype.get = function () {
        return this.renderableObjects;
    };
    RenderableObjectList.prototype.push = function (renderableObject) {
        this.renderableObjects.push(renderableObject);
    };
    RenderableObjectList.prototype.pop = function () {
        return this.renderableObjects.pop();
    };
    RenderableObjectList.prototype.size = function () {
        return this.renderableObjects.length;
    };
    RenderableObjectList.prototype.removeAll = function () {
        this.renderableObjects.length = 0;
    };
    return RenderableObjectList;
}());

var attributes$2 = ["aVertexPosition", "aVertexColor", "aVertexSelectionColor", "aVertexNormal", "aTextureCoordinate"];
var uniforms$2 = ["uModelViewMatrix", "uProjectionMatrix", "uOrthographicMatrix", "uObjectMatrix", "uRotationMatrix", "uNormalMatrix", "uPointSize", "uNearFar", "uPositionType", "uTexture", "uTextureType"];
var vertexShaderSource$2 = "\n  attribute vec3 aVertexPosition;\n  attribute vec4 aVertexColor;\n  attribute vec4 aVertexSelectionColor;\n  attribute vec3 aVertexNormal;\n  attribute vec2 aTextureCoordinate;\n  \n  uniform mat4 uModelViewMatrix;\n  uniform mat4 uProjectionMatrix;\n  uniform mat4 uOrthographicMatrix;\n  uniform mat4 uObjectMatrix;\n  uniform mat4 uRotationMatrix;\n  uniform mat4 uNormalMatrix;\n  uniform float uPointSize;\n  uniform vec2 uNearFar;\n  uniform int uPositionType; // 1: plane, 2: depth, basic\n\n  varying vec4 vColor;\n  varying vec4 vSelectionColor;\n  varying vec3 vTransformedNormal;\n  varying vec2 vTextureCoordinate;\n  varying float vDepth;\n\n  vec4 getOrthoPosition() {\n    vec4 transformedPosition = uObjectMatrix * vec4(aVertexPosition, 1.0);\n    vec4 orthoPosition = uModelViewMatrix * vec4(transformedPosition.xyz, 1.0);\n    return orthoPosition;\n  }\n  vec3 getRotatedNormal() {\n    vec3 rotatedModelNormal = (uRotationMatrix * vec4(aVertexNormal, 1.0)).xyz;\n    vec3 rotatedNormal = normalize(uNormalMatrix * vec4(rotatedModelNormal, 1.0)).xyz;\n    return rotatedNormal;\n  }\n  float calcDepth(float zValue) {\n    return -(zValue / uNearFar.y);\n  }\n\n  void main(void) {\n    vColor = aVertexColor;\n    vSelectionColor = aVertexSelectionColor;\n    gl_PointSize = uPointSize;\n\n    vec4 orthoPosition = getOrthoPosition();\n    vTransformedNormal = getRotatedNormal();\n\n    vDepth = calcDepth(orthoPosition.z);\n    gl_Position = uProjectionMatrix * orthoPosition;\n    \n    vTextureCoordinate = aTextureCoordinate;\n  }\n";
var fragmentShaderSource$2 = "\n  precision highp float;\n\n  varying vec4 vColor;\n  varying vec4 vSelectionColor;\n  varying vec2 vTextureCoordinate;\n  varying vec3 vTransformedNormal;\n  varying float vDepth;\n\n  uniform sampler2D uTexture;\n  uniform int uTextureType; // default : color, 1 : texture, 2 : reverseY, 3 : depth\n  \n  vec3 encodeNormal(in vec3 normal) {\n    return normal.xyz * 0.5 + 0.5;\n  }\n  vec3 decodeNormal(in vec3 normal){\n    return normal * 2.0 - 1.0;\n  }\n  vec4 packDepth(float depth) {\n    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * depth;\n    enc = fract(enc);\n    enc -= enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n    return enc;\n  }\n\n  void main(void) {\n    if (uTextureType == 1) {\n      //gl_FragColor = vec4(vColor.xyz, vColor.a);\n      gl_FragColor = texture2D(uTexture, vec2(vTextureCoordinate.x, 1.0 - vTextureCoordinate.y));\n    } else if (uTextureType == 2) {\n      gl_FragColor = vec4(vSelectionColor.xyz, vSelectionColor.a);\n    } else if (uTextureType == 3) {\n      gl_FragColor = packDepth(vDepth);\n    } else if (uTextureType == 4) {\n      gl_FragColor = vec4(encodeNormal(vTransformedNormal), 1.0);\n    } else if (uTextureType == 5) {\n      gl_FragColor = vec4(vColor.xyz, vColor.a);\n    }  else {\n      gl_FragColor = vec4(vColor.xyz, vColor.a);\n    }\n  }\n";
var DefaultShader = {
    attributes: attributes$2,
    uniforms: uniforms$2,
    vertexShaderSource: vertexShaderSource$2,
    fragmentShaderSource: fragmentShaderSource$2,
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var ShaderProcess = /** @class */ (function () {
    function ShaderProcess(gl, shader, globalOptions) {
        this._gl = gl;
        this._canvas = gl.canvas;
        this._shader = shader;
        this._shaderInfo = shader.shaderInfo;
        this._globalOptions = globalOptions;
    }
    ShaderProcess.prototype.preprocess = function () {
        throw new Error("preprocess() is abstract method. Abstract methods must be overriding.");
    };
    ShaderProcess.prototype.process = function () {
        throw new Error("process() is abstract method. Abstract methods must be overriding.");
    };
    ShaderProcess.prototype.postprocess = function () {
        throw new Error("postprocess() is abstract method. Abstract methods must be overriding.");
    };
    Object.defineProperty(ShaderProcess.prototype, "gl", {
        get: function () {
            return this._gl;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderProcess.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderProcess.prototype, "shader", {
        get: function () {
            return this._shader;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderProcess.prototype, "globalOptions", {
        get: function () {
            return this._globalOptions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderProcess.prototype, "shaderInfo", {
        get: function () {
            return this._shaderInfo;
        },
        enumerable: false,
        configurable: true
    });
    return ShaderProcess;
}());

var DefaultShaderProcess = /** @class */ (function (_super) {
    __extends(DefaultShaderProcess, _super);
    function DefaultShaderProcess(gl, shader, globalOptions, camera, frameBufferObjs, renderableList) {
        var _this = _super.call(this, gl, shader, globalOptions) || this;
        _this.camera = camera;
        _this.frameBufferObjs = frameBufferObjs;
        _this.renderableList = renderableList;
        return _this;
    }
    DefaultShaderProcess.prototype.preprocess = function () { };
    DefaultShaderProcess.prototype.process = function () {
        var _this = this;
        var gl = this.gl;
        var shaderInfo = this.shaderInfo;
        var globalOptions = this.globalOptions;
        this.shader.useProgram();
        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);
        var modelViewMatrix = this.camera.getModelViewMatrix();
        var normalMatrix = this.camera.getNormalMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(globalOptions.near, globalOptions.far));
        gl.uniform1f(shaderInfo.uniformLocations.pointSize, globalOptions.pointSize);
        gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
        this.frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.clear();
        });
        this.renderableList.get().forEach(function (renderableObj) {
            (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(_this.renderableList) : undefined;
            renderableObj.render(gl, shaderInfo, _this.frameBufferObjs);
        });
    };
    DefaultShaderProcess.prototype.postprocess = function () { };
    return DefaultShaderProcess;
}(ShaderProcess));

var attributes$1 = ["aVertexPosition", "aTextureCoordinate"];
var uniforms$1 = ["uIsMain", "uSsaoKernel", "uScreenSize", "uNoiseScale",
    "uAspectRatio", "uProjectionMatrix", "uTangentOfHalfFovy", "uNearFar",
    "uMainTexture", "uAlbedoTexture", "uSelectionTexture", "uNormalTexture",
    "uDepthTexture", "uNoiseTexture", "uLightMapTexture", "uCameraTransformMatrix", "uSunModelViewMatrix", "uOrthographicMatrix", "uSunNormalMatrix",
    "uEnableGlobalLight", "uEnableEdge", "uEnableSsao", "uSelectedObjectId"];
var vertexShaderSource$1 = "\n  #pragma vscode_glsllint_stage : vert\n  attribute vec3 aVertexPosition;\n  attribute vec2 aTextureCoordinate;\n\n  varying vec2 vTextureCoordinate;\n  void main(void) {\n    vTextureCoordinate = aTextureCoordinate;\n    gl_Position = vec4(aVertexPosition.xy * 2.0 - 1.0, 0.0, 1.0);\n  }\n";
var fragmentShaderSource$1 = "\n  #pragma vscode_glsllint_stage : frag\n  precision highp float;\n  \n  uniform int uIsMain;\n  uniform float uTangentOfHalfFovy;\n  uniform float uAspectRatio;\n\n  uniform vec2 uScreenSize;  \n  uniform vec2 uNearFar;\n  uniform vec2 uNoiseScale;\n  uniform mat4 uProjectionMatrix;\n  uniform mat4 uCameraTransformMatrix;\n  uniform mat4 uSunModelViewMatrix;\n  uniform mat4 uOrthographicMatrix;\n  uniform mat4 uSunNormalMatrix;\n\n  uniform sampler2D uMainTexture;\n  uniform sampler2D uAlbedoTexture;\n  uniform sampler2D uSelectionTexture;\n  uniform sampler2D uNormalTexture;\n  uniform sampler2D uDepthTexture;\n  uniform sampler2D uLightMapTexture;\n  uniform sampler2D uNoiseTexture;\n  uniform vec3 uSsaoKernel[16];\n\n  uniform int uEnableGlobalLight;\n  uniform int uEnableEdge;\n  uniform int uEnableSsao;\n  uniform float uSelectedObjectId;\n\n  varying vec2 vTextureCoordinate;\n  \n  const int kernelSize = 16;\n  const float fKernelSize = float(kernelSize);\n\n  vec4 decodeNormal(in vec4 normal) {\n    return vec4(normal.xyz * 2.0 - 1.0, normal.w);\n  }\n  float convertColorToId(vec4 color) {\n    return (color.r * 255.0 * 16777216.0) + (color.g * 255.0 * 65536.0) + (color.b * 255.0 * 256.0) + (color.a * 255.0);\n  }\n  float unpackDepth(vec4 packedDepth) {\n    return dot(packedDepth, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0));\n  }\n  vec3 getViewRay(vec2 tc, in float relFar) {\n    float hfar = 2.0 * uTangentOfHalfFovy * relFar;\n    float wfar = hfar * uAspectRatio;    \n    vec3 ray = vec3(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -relFar);    \n    return ray;\n  }\n  vec4 getAlbedo(vec2 screenPos) {\n    return texture2D(uAlbedoTexture, screenPos);\n  }\n  vec4 getSelection(vec2 screenPos) {\n    return texture2D(uSelectionTexture, screenPos);\n  }\n  vec4 getNormal(vec2 screenPos) {\n    return texture2D(uNormalTexture, screenPos);\n  }\n  vec4 getDepth(vec2 screenPos) {\n    //return texture2D(uLightMapTexture, screenPos);\n    return texture2D(uDepthTexture, screenPos);\n  }\n\n  float getOcclusion(vec3 origin, vec3 rotatedKernel, float radius) {\n    float resultOcclusion = 1.0;\n    vec3 sample = origin + (rotatedKernel * radius);\n    vec4 offset = uProjectionMatrix * vec4(sample, 1.0);\n    vec3 offsetCoord = vec3(offset.xyz);\t\t\t\t\n    offsetCoord.xyz /= offset.w;\n    offsetCoord.xyz = offsetCoord.xyz * 0.5 + 0.5;\n    if ((abs(offsetCoord.x) > 1.0 || abs(offsetCoord.y) > 1.0) && (abs(offsetCoord.x) < 0.0 || abs(offsetCoord.y) < 0.0)) {\n        resultOcclusion = 0.0;\n    } else {\n      float depthBufferValue = unpackDepth(texture2D(uDepthTexture, offsetCoord.xy));\n      float sampleZ = -sample.z;\n      float bufferZ = depthBufferValue * uNearFar.y;\n      float zDiff = abs(bufferZ - sampleZ);\n      if (zDiff < radius) {\n        if (bufferZ < sampleZ) {\n          resultOcclusion = 0.0;\n        }\n      }\n    }\n    return resultOcclusion;\n  }\n\n  vec4 getSSAO(in vec2 screenPos) {\n    float occlusionA = 0.0;\n    float occlusionB = 0.0;\n    float occlusionC = 0.0;\n\n    float linearDepth = unpackDepth(getDepth(screenPos));\n    float originDepth = linearDepth * uNearFar.y;\n    vec3 origin = getViewRay(screenPos, originDepth);\n    vec3 normal = decodeNormal(texture2D(uNormalTexture, screenPos)).xyz;\n\n    vec3 rvec = texture2D(uNoiseTexture, screenPos.xy * uNoiseScale).xyz * 2.0 - 1.0;\n\t\tvec3 tangent = normalize(rvec - normal * dot(rvec, normal));\n\t\tvec3 bitangent = normalize(cross(normal, tangent));\n\t\tmat3 tbn = mat3(tangent, bitangent, normal);   \n\t\tfor (int i = 0; i < kernelSize; i++) {    \t\n      vec3 rotatedKernel = tbn * vec3(uSsaoKernel[i].x, uSsaoKernel[i].y, uSsaoKernel[i].z);\n      occlusionA += getOcclusion(origin, rotatedKernel, 8.5);\n      occlusionB += getOcclusion(origin, rotatedKernel, 16.0);\n      occlusionC += getOcclusion(origin, rotatedKernel, 32.0);\n    }\n\n    float tolerance = 0.80;\n    float result = (occlusionA + occlusionB + occlusionC) / (fKernelSize * 3.0);\n    if (result > tolerance) {\n      result = 1.0;\n    }\n    //return result;\n\n    return vec4(occlusionA / fKernelSize, occlusionB / fKernelSize, occlusionC / fKernelSize, 1.0);\n  }\n\n  float compareNormalOffset(in vec4 normalA, in vec4 normalB) {\n    float result = 0.0; \n    result += abs(normalA.x - normalB.x);\n    result += abs(normalA.y - normalB.y);\n    result += abs(normalA.z - normalB.z);\n    return result;\n  }\n\n  bool isEdge(vec2 screenPos) {\n    float width = 1.0 / uScreenSize.x;\n\t  float height = 1.0 / uScreenSize.y;\n    vec2 rightPos = vec2(screenPos.x + width, screenPos.y);\n    vec2 bottomPos = vec2(screenPos.x, screenPos.y + height);\n    vec2 crossPos = vec2(screenPos.x + width, screenPos.y + height);\n    vec2 leftPos = vec2(screenPos.x - width, screenPos.y);\n    \n    float selection = convertColorToId(getSelection(screenPos));\n    float selectionRight = convertColorToId(getSelection(rightPos));\n    float selectionBottom = convertColorToId(getSelection(bottomPos));\n    float selectionCross = convertColorToId(getSelection(crossPos));\n    float selectionLeft = convertColorToId(getSelection(leftPos));\n\n    vec4 normal = decodeNormal(getNormal(screenPos));\n    vec4 normalRight = decodeNormal(getNormal(rightPos));\n    vec4 normalBottom = decodeNormal(getNormal(bottomPos));\n    vec4 normalCross = decodeNormal(getNormal(crossPos));\n\n    float compareOffset = 0.3;\n    bool normalCompareRight = compareOffset < compareNormalOffset(normal, normalRight);\n    bool normalCompareBottom = compareOffset < compareNormalOffset(normal, normalBottom);\n    bool normalCompareCross = compareOffset < compareNormalOffset(normal, normalCross);\n\n    bool isEdgeByNormalCompare = normalCompareRight || normalCompareBottom || normalCompareCross;\n    bool isEdgeBySelection = selection != selectionBottom || selection != selectionRight || selection != selectionCross || selection != selectionLeft;\n\n    return isEdgeByNormalCompare || isEdgeBySelection;\n  }\n\n  bool isShadow(vec2 screenPos) {\n    bool result = false;\n\n    float linearDepth = unpackDepth(getDepth(screenPos));\n    float originDepth = linearDepth * uNearFar.y;\n    vec3 positionCC = getViewRay(screenPos, originDepth);\n    vec4 positionWC = uCameraTransformMatrix * vec4(positionCC, 1.0);\n    vec4 positionSC = uSunModelViewMatrix * vec4(positionWC.xyz, 1.0);\n\n    positionSC = uOrthographicMatrix * positionSC;\n    vec3 positionUnitarySCaux = positionSC.xyz / positionSC.w; // Range : -1.0 ~ 1.0\n    vec3 positionUnitarySC = positionUnitarySCaux * 0.5 + 0.5; // Range = 0.0 ~ 1.0\n\n    if (positionUnitarySC.z > 0.9999) {\n      return result;\n    }\n    if (positionUnitarySC.x > 1.0 || positionUnitarySC.x < 0.0 || positionUnitarySC.y > 1.0 || positionUnitarySC.y < 0.0) {\n      return result;\n    }\n\n    vec4 fromDepthSunTextureVec4 = texture2D(uLightMapTexture, positionUnitarySC.xy) ;\n    fromDepthSunTextureVec4 = fromDepthSunTextureVec4 * 1.001;\n    float fromDepthSunTexture = unpackDepth(fromDepthSunTextureVec4);\n\n    result = positionUnitarySC.z > fromDepthSunTexture;\n    return result;\n  }\n\n  void main(void) {\n    float width = 1.0 / uScreenSize.x;\n\t  float height = 1.0 / uScreenSize.y;\n    vec2 screenPos = vec2(gl_FragCoord.x / uScreenSize.x, gl_FragCoord.y / uScreenSize.y);\n\n    vec4 albedo = getAlbedo(screenPos);\n    vec4 normal = decodeNormal(getNormal(screenPos));\n\n    vec4 selectionColor = getSelection(screenPos);\n    float selection = convertColorToId(getSelection(screenPos));\n\n    vec3 ambientLight = vec3(0.3, 0.3, 0.3);\n    vec3 directionalLightColor = vec3(0.9, 0.9, 0.9);\n    vec3 directionalVector = normalize(vec3(0.6, 0.6, 0.9));\n    float directional = max(dot(normal.xyz, directionalVector), 0.0);\n    vec3 vLighting = ambientLight + (directionalLightColor * directional);\n\n    if (uIsMain == 1) {\n      vec3 result = albedo.xyz;\n      \n      if (uEnableSsao == 1) {\n        //float ssaoResult = getSSAO(screenPos);\n        float tolerance = 0.80;\n        vec4 ssaoResult = getSSAO(screenPos);\n\n        if (ssaoResult.x < tolerance) {\n          result = result * ssaoResult.x;\n        }\n        if (ssaoResult.y < tolerance) {\n          result = result * (ssaoResult.y + 0.1);\n        }\n        if (ssaoResult.z < tolerance) {\n          result = result * (ssaoResult.z + 0.2);\n        }\n        //result = result * ssaoResult;\n      }\n\n      //result = result * vLighting;\n      if (uEnableGlobalLight == 1 && isShadow(screenPos)) {\n        result = result * 0.5;\n      }\n\n      if (selection == uSelectedObjectId) {\n        result.b = result.b * 1.5;\n      }\n      if (uEnableEdge == 1 && isEdge(screenPos)) {\n        result = result * 0.5;\n        if (selection == uSelectedObjectId) {\n          result.b = 1.0;\n        }\n      }\n      gl_FragColor = vec4(result, 1.0);\n    } else {\n      vec4 textureColor = texture2D(uMainTexture, vTextureCoordinate);\n      gl_FragColor = vec4(textureColor.rgb, textureColor.a);\n    }\n  }\n";
var ScreenShader = {
    attributes: attributes$1,
    uniforms: uniforms$1,
    vertexShaderSource: vertexShaderSource$1,
    fragmentShaderSource: fragmentShaderSource$1,
};

var Buffer = /** @class */ (function () {
    function Buffer(gl) {
        this._gl = gl;
    }
    Object.defineProperty(Buffer.prototype, "gl", {
        get: function () {
            return this._gl;
        },
        enumerable: false,
        configurable: true
    });
    Buffer.prototype.bindBuffer = function (glBuffer, size, attributeLocation) {
        if (size === void 0) { size = 3; }
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, 0, 0);
    };
    Buffer.prototype.createBuffer = function (data) {
        var gl = this.gl;
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    };
    Buffer.prototype.createIndexBuffer = function (data) {
        var gl = this.gl;
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    };
    Buffer.prototype.createTexture = function (image) {
        var gl = this.gl;
        var texWrap = gl.CLAMP_TO_EDGE;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texWrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texWrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        return texture;
    };
    Buffer.prototype.createNoiseTexture = function () {
        var NOISE_SIZE = 4;
        var pixels = new Uint8Array(NOISE_SIZE * NOISE_SIZE * NOISE_SIZE);
        for (var y = 0; y < NOISE_SIZE; y++) {
            for (var x = 0; x < NOISE_SIZE; x++) {
                pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 0] = Math.floor(255 * Math.random());
                pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 1] = Math.floor(255 * Math.random());
                pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 2] = Math.floor(255 * Math.random());
                pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 3] = Math.floor(255 * Math.random());
            }
        }
        var gl = this.gl;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, NOISE_SIZE, NOISE_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    };
    return Buffer;
}());

var Renderable = /** @class */ (function () {
    function Renderable() {
        if (this.constructor === Renderable) {
            throw new Error("Renderable is abstract class. Created an instance of an abstract class.");
        }
        this.name = "Untitled";
        this.position = vec3.fromValues(0, 0, 0);
        this.rotation = vec3.fromValues(0, 0, 0);
        this.color = vec4.fromValues(0.4, 0.4, 0.4, 1);
        this.selectionColor = vec4.fromValues(0.0, 0.0, 0.0, 1);
        this.dirty = false;
    }
    // eslint-disable-next-line no-unused-vars
    Renderable.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        throw new Error("render() is abstract method. Abstract methods must be overriding.");
    };
    // eslint-disable-next-line no-unused-vars
    Renderable.prototype.getBuffer = function (gl) {
        throw new Error("render() is abstract method. Abstract methods must be overriding.");
    };
    Renderable.prototype.getTransformMatrix = function () {
        if (!this.transformMatrix || this.dirty === true) {
            var tm = mat4.create();
            mat4.identity(tm);
            mat4.rotate(tm, tm, Math.radian(this.rotation[1]), vec3.fromValues(0, 1, 0));
            mat4.rotate(tm, tm, Math.radian(this.rotation[2]), vec3.fromValues(0, 0, 1));
            mat4.rotate(tm, tm, Math.radian(this.rotation[0]), vec3.fromValues(1, 0, 0));
            tm[12] = this.position[0];
            tm[13] = this.position[1];
            tm[14] = this.position[2];
            this.transformMatrix = tm;
        }
        return this.transformMatrix;
    };
    Renderable.prototype.getRotationMatrix = function () {
        if (!this.rotationMatrix || this.dirty === true) {
            this.rotationMatrix = mat4.clone(this.getTransformMatrix());
            this.rotationMatrix[12] = 0;
            this.rotationMatrix[13] = 0;
            this.rotationMatrix[14] = 0;
        }
        return this.rotationMatrix;
    };
    Renderable.prototype.getId = function () {
        return this.id;
    };
    Renderable.prototype.calcNormal = function (pa, pb, pc) {
        var d0 = vec3.create();
        var d1 = vec3.create();
        d0 = vec3.subtract(d0, pb, pa);
        d1 = vec3.subtract(d1, pc, pb);
        var normal = vec3.create();
        vec3.cross(normal, d0, d1);
        vec3.normalize(normal, normal);
        return normal;
    };
    Renderable.prototype.intersection = function (a1, a2, b1, b2) {
        var a = this.dot(this.cross(a1, a2, b1), this.cross(a1, a2, b2));
        var b = this.dot(this.cross(b1, b2, a1), this.cross(b1, b2, a2));
        return a <= 0 && b <= 0;
    };
    Renderable.prototype.cross = function (a, b, c) {
        var d0 = vec3.subtract(vec3.create(), b, a);
        var d1 = vec3.subtract(vec3.create(), c, b);
        return vec3.cross(vec3.create(), d0, d1);
    };
    Renderable.prototype.dot = function (a, b) {
        return vec3.dot(a, b);
    };
    Renderable.prototype.normal = function (a, b, c) {
        var crossed = this.cross(a, b, c);
        return vec3.normalize(crossed, crossed);
    };
    Renderable.prototype.getMinMax = function (positions) {
        var minx = Number.MAX_SAFE_INTEGER;
        var miny = Number.MAX_SAFE_INTEGER;
        var maxx = Number.MIN_SAFE_INTEGER;
        var maxy = Number.MIN_SAFE_INTEGER;
        positions.forEach(function (position) {
            minx = position[0] < minx ? position[0] : minx;
            miny = position[1] < miny ? position[1] : miny;
            maxx = position[0] > maxx ? position[0] : maxx;
            maxy = position[1] > maxy ? position[1] : maxy;
        });
        return {
            minx: minx,
            miny: miny,
            maxx: maxx,
            maxy: maxy
        };
    };
    Renderable.prototype.convertIdToColor = function (id) {
        if (id === void 0) { id = this.id; }
        var calc = function (value, div) { return Math.floor(value / div) % 256 / 255; };
        return vec4.fromValues(calc(id, 16777216), calc(id, 65536), calc(id, 256), calc(id, 1));
    };
    Renderable.prototype.convertColorToId = function (color) {
        return (color[0] * 16777216) + (color[1] * 65536) + (color[2] * 256) + (color[3]);
    };
    Renderable.prototype.createRenderableObjectId = function (renderableList) {
        var result = this.id;
        var _loop_1 = function () {
            var ID_RANGE = 10000000;
            var randomId = Math.ceil(Math.random() * ID_RANGE);
            var obj = renderableList.get().find(function (renderableObj) {
                return renderableObj.id == randomId;
            });
            if (!obj) {
                result = randomId;
                this_1.id = randomId;
                this_1.selectionColor = this_1.convertIdToColor(randomId);
            }
        };
        var this_1 = this;
        while (result === undefined) {
            _loop_1();
        }
        return result;
    };
    return Renderable;
}());

var GeometryPlane = /** @class */ (function () {
    function GeometryPlane(position, normal) {
        this.set(position, normal);
    }
    GeometryPlane.prototype.set = function (position, normal) {
        this.normal = normal;
        this.position = position;
        this.distance = -(normal[0] * position[0] + normal[1] * position[1] + normal[2] * position[2]);
    };
    GeometryPlane.prototype.getIntersection = function (line) {
        var normal = this.normal;
        var position = line.position;
        var direction = line.direction;
        var test = (normal[0] * direction[0]) + (normal[1] * direction[1]) + (normal[2] * direction[2]);
        if (Math.abs(test) > Number.MIN_VALUE) {
            var lambda = -((normal[0] * position[0] + normal[1] * position[1] + normal[2] * position[2] + this.distance) / test);
            var x = position[0] + lambda * direction[0];
            var y = position[1] + lambda * direction[1];
            var z = position[2] + lambda * direction[2];
            return vec3.fromValues(x, y, z);
        }
        else {
            return null;
        }
    };
    return GeometryPlane;
}());

var Triangle = /** @class */ (function () {
    function Triangle(position1, position2, position3) {
        this.positions = [position1, position2, position3];
        this.getNormal();
    }
    Triangle.prototype.get = function (index) {
        return this.positions[index];
    };
    Triangle.prototype.getNormal = function () {
        if (this.normal === undefined) {
            var directionA = vec3.subtract(vec3.create(), this.positions[1], this.positions[0]);
            var directionB = vec3.subtract(vec3.create(), this.positions[2], this.positions[1]);
            var normal = vec3.cross(vec3.create(), directionA, directionB);
            vec3.normalize(normal, normal);
            this.normal = normal;
        }
        return this.normal;
    };
    Triangle.prototype.getPlane = function () {
        if (!this.plane) {
            this.plane = new GeometryPlane(this.positions[0], this.normal);
        }
        return this.plane;
    };
    return Triangle;
}());

var Screen = /** @class */ (function (_super) {
    __extends(Screen, _super);
    function Screen(coordinates, options) {
        var _this = _super.call(this) || this;
        _this.forDebug = false;
        _this.init(coordinates, options);
        return _this;
    }
    Screen.prototype.init = function (coordinates, options) {
        this.length = 0;
        this.name = "Untitled Screen";
        if (coordinates)
            this.coordinates = coordinates;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if (options === null || options === void 0 ? void 0 : options.forDebug)
            this.forDebug = options.forDebug;
        if (options === null || options === void 0 ? void 0 : options.textureLocation)
            this.textureLocation = options.textureLocation;
    };
    Screen.prototype.setGlTextureNumber = function (glTextureNumber) {
        this.glTextureNumber = glTextureNumber;
    };
    Screen.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
        buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
        gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
    };
    Screen.prototype.getBuffer = function (gl) {
        var _this = this;
        this.dirty = (this.buffer === undefined || this.length != this.coordinates.length);
        if (this.dirty === true) {
            this.buffer = new Buffer(gl);
            var color_1 = this.color;
            var selectionColor_1 = this.selectionColor;
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            var normals_1 = [];
            var textureCoordinates_1 = [];
            var rectanglePositions = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], _this.position[2]); });
            var bbox_1 = this.getMinMax(rectanglePositions);
            var leftTriangle = new Triangle(rectanglePositions[0], rectanglePositions[2], rectanglePositions[3]);
            var rightTriangle = new Triangle(rectanglePositions[0], rectanglePositions[1], rectanglePositions[2]);
            var triangles = [leftTriangle, rightTriangle];
            triangles.forEach(function (triangle) {
                var trianglePositions = triangle.positions;
                var normal = triangle.getNormal();
                trianglePositions.forEach(function (position) {
                    position.forEach(function (value) { return positions_1.push(value); });
                    normal.forEach(function (value) { return normals_1.push(value); });
                    color_1.forEach(function (value) { return colors_1.push(value); });
                    selectionColor_1.forEach(function (value) { return selectionColors_1.push(value); });
                    var rangeX = bbox_1.maxx - bbox_1.minx;
                    var rangeY = bbox_1.maxy - bbox_1.miny;
                    textureCoordinates_1.push((position[0] - bbox_1.minx) / rangeX);
                    textureCoordinates_1.push((position[1] - bbox_1.miny) / rangeY);
                });
            });
            this.length = this.coordinates.length;
            var indices = new Uint16Array(positions_1.length / 3);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.normalVBO = new Float32Array(normals_1);
            this.buffer.textureVBO = new Float32Array(textureCoordinates_1);
            this.buffer.texture = this.texture;
            this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    };
    return Screen;
}(Renderable));

var ScreenShaderProcess = /** @class */ (function (_super) {
    __extends(ScreenShaderProcess, _super);
    function ScreenShaderProcess(gl, shader, globalOptions, camera, frameBufferObjs, sun) {
        var _this = _super.call(this, gl, shader, globalOptions) || this;
        _this.camera = camera;
        _this.frameBufferObjs = frameBufferObjs;
        _this.buffer = new Buffer(gl);
        _this.sun = sun;
        return _this;
    }
    ScreenShaderProcess.prototype.preprocess = function () {
        var gl = this.gl;
        var shaderInfo = this.shaderInfo;
        this.screens = [];
        this.mainScreen = new Screen([[0, 0], [1, 0], [1, 1], [0, 1]], { reverse: true, forDebug: false, textureLocation: shaderInfo.uniformLocations.mainTexture });
        this.albedoScreen = new Screen([[0.85, 0.85], [1, 0.85], [1, 1], [0.85, 1]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.albedoTexture });
        this.selectionScreen = new Screen([[0.85, 0.7], [1, 0.7], [1, 0.85], [0.85, 0.85]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.selectionTexture });
        this.normalScreen = new Screen([[0.85, 0.55], [1, 0.55], [1, 0.7], [0.85, 0.7]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.normalTexture });
        this.depthScreen = new Screen([[0.85, 0.40], [1, 0.40], [1, 0.55], [0.85, 0.55]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.depthTexture });
        this.lightMapDepthScreen = new Screen([[0.92, 0.25], [1, 0.25], [1, 0.40], [0.92, 0.40]], { reverse: true, forDebug: true, textureLocation: shaderInfo.uniformLocations.lightMapTexture });
        this.screens.push(this.mainScreen);
        this.screens.push(this.albedoScreen);
        this.screens.push(this.selectionScreen);
        this.screens.push(this.normalScreen);
        this.screens.push(this.depthScreen);
        this.screens.push(this.lightMapDepthScreen);
        this.noiseTexture = this.buffer.createNoiseTexture();
        this.mainScreen.glTextureNumber = gl.TEXTURE0;
        this.albedoScreen.glTextureNumber = gl.TEXTURE1;
        this.selectionScreen.glTextureNumber = gl.TEXTURE2;
        this.normalScreen.glTextureNumber = gl.TEXTURE3;
        this.depthScreen.glTextureNumber = gl.TEXTURE4;
        this.lightMapDepthScreen.glTextureNumber = gl.TEXTURE5;
        this.noiseTextureNumber = gl.TEXTURE6;
    };
    ScreenShaderProcess.prototype.process = function () {
        var gl = this.gl;
        var canvas = this.canvas;
        var shaderInfo = this.shaderInfo;
        var globalOptions = this.globalOptions;
        this.shader.useProgram();
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.lineWidth(globalOptions.lineWidth);
        var fovy = Math.radian(this.camera.fovyDegree);
        var tangentOfHalfFovy = Math.tan(fovy / 2);
        var orthographicMatrix = mat4.create();
        mat4.ortho(orthographicMatrix, -8192, 8192, -8192, 8192, 0, 8192);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.orthographicMatrix, false, orthographicMatrix);
        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fovy, globalOptions.aspect, globalOptions.near, globalOptions.far);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        var cameraTransformMatrix = this.camera.getTransformMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.cameraTransformMatrix, false, cameraTransformMatrix);
        var sunModelViewMatrix = this.sun.getModelViewMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.sunModelViewMatrix, false, sunModelViewMatrix);
        var sunNormalMatrix = this.sun.getNormalMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.sunNormalMatrix, false, sunNormalMatrix);
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
        gl.uniform1f(shaderInfo.uniformLocations.selectedObjectId, globalOptions.selectedObjectId);
        gl.uniform1f(shaderInfo.uniformLocations.aspectRatio, globalOptions.aspect);
        gl.uniform1i(shaderInfo.uniformLocations.enableSsao, globalOptions.enableSsao ? 1 : 0);
        gl.uniform1i(shaderInfo.uniformLocations.enableEdge, globalOptions.enableEdge ? 1 : 0);
        gl.uniform1i(shaderInfo.uniformLocations.enableGlobalLight, globalOptions.enableGlobalLight ? 1 : 0);
        gl.uniform1f(shaderInfo.uniformLocations.tangentOfHalfFovy, tangentOfHalfFovy);
        gl.uniform2fv(shaderInfo.uniformLocations.screenSize, vec2.fromValues(canvas.width, canvas.height));
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(globalOptions.near, globalOptions.far));
        gl.uniform2fv(shaderInfo.uniformLocations.noiseScale, vec2.fromValues(canvas.width / 4.0, canvas.height / 4.0));
        var ssaoKernelSample = [0.33, 0.0, 0.85,
            0.25, 0.3, 0.5,
            0.1, 0.3, 0.85,
            -0.15, 0.2, 0.85,
            -0.33, 0.05, 0.6,
            -0.1, -0.15, 0.85,
            -0.05, -0.32, 0.25,
            0.2, -0.15, 0.85,
            0.6, 0.0, 0.55,
            0.5, 0.6, 0.45,
            -0.01, 0.7, 0.35,
            -0.33, 0.5, 0.45,
            -0.45, 0.0, 0.55,
            -0.65, -0.5, 0.7,
            0.0, -0.5, 0.55,
            0.33, 0.3, 0.35];
        var ssaoKernel = new Float32Array(ssaoKernelSample);
        gl.uniform3fv(shaderInfo.uniformLocations.ssaoKernel, ssaoKernel);
        this.screens.forEach(function (screen, index) {
            gl.activeTexture(screen.glTextureNumber);
            gl.bindTexture(gl.TEXTURE_2D, screen.texture);
            gl.uniform1i(screen.textureLocation, index);
        });
        gl.activeTexture(this.noiseTextureNumber);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.uniform1i(shaderInfo.uniformLocations.noiseTexture, this.screens.length);
    };
    ScreenShaderProcess.prototype.postprocess = function () {
        var _this = this;
        var gl = this.gl;
        var shaderInfo = this.shaderInfo;
        var globalOptions = this.globalOptions;
        gl.disable(gl.DEPTH_TEST);
        gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
        this.screens.forEach(function (screen, index) {
            if (index == 0) {
                gl.uniform1i(shaderInfo.uniformLocations.isMain, 1);
            }
            else {
                gl.uniform1i(shaderInfo.uniformLocations.isMain, 0);
            }
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, screen.texture);
            screen.texture = _this.frameBufferObjs[index].texture;
            if (!globalOptions.debugMode && screen.forDebug) {
                return;
            }
            screen.render(gl, shaderInfo, []);
        });
        gl.enable(gl.DEPTH_TEST);
    };
    return ScreenShaderProcess;
}(ShaderProcess));

var attributes = ["aVertexPosition", "aVertexColor", "aVertexSelectionColor", "aVertexNormal", "aTextureCoordinate"];
var uniforms = ["uModelViewMatrix", "uProjectionMatrix", "uOrthographicMatrix", "uObjectMatrix", "uRotationMatrix", "uNormalMatrix", "uPointSize", "uPositionType", "uNearFar", "uTexture", "uTextureType"];
var vertexShaderSource = "\n  attribute vec3 aVertexPosition;\n  attribute vec4 aVertexColor;\n  attribute vec4 aVertexSelectionColor;\n  attribute vec3 aVertexNormal;\n  attribute vec2 aTextureCoordinate;\n  \n  uniform mat4 uModelViewMatrix;\n  uniform mat4 uProjectionMatrix;\n  uniform mat4 uOrthographicMatrix;\n  uniform mat4 uObjectMatrix;\n  uniform mat4 uRotationMatrix;\n  uniform mat4 uNormalMatrix;\n  uniform float uPointSize;\n  uniform vec2 uNearFar;\n\n  varying vec4 vColor;\n  varying vec4 vSelectionColor;\n  varying vec3 vTransformedNormal;\n  varying float vDepth;\n\n  vec4 getOrthoPosition() {\n    vec4 transformedPosition = uObjectMatrix * vec4(aVertexPosition, 1.0);\n    vec4 orthoPosition = uModelViewMatrix * vec4(transformedPosition.xyz, 1.0);\n    return orthoPosition;\n  }\n  vec3 getRotatedNormal() {\n    vec3 rotatedModelNormal = (uRotationMatrix * vec4(aVertexNormal, 1.0)).xyz;\n    vec3 rotatedNormal = normalize(uNormalMatrix * vec4(rotatedModelNormal, 1.0)).xyz;\n    return rotatedNormal;\n  }\n  float calcDepth(float zValue) {\n    return -(zValue / uNearFar.y);\n  }\n\n  void main(void) {\n    vColor = aVertexColor;\n    vSelectionColor = aVertexSelectionColor;\n    gl_PointSize = uPointSize;\n\n    vec4 orthoPosition = getOrthoPosition();\n    vTransformedNormal = getRotatedNormal();\n\n    vDepth = calcDepth(orthoPosition.z);\n    gl_Position = uOrthographicMatrix * orthoPosition;\n  }\n";
var fragmentShaderSource = "\n  precision highp float;\n\n  varying vec4 vColor;\n  varying vec4 vSelectionColor;\n  varying vec3 vTransformedNormal;\n  varying float vDepth;\n\n  uniform sampler2D uTexture;\n  uniform int uTextureType;\n\n  vec4 packDepth(float depth) {\n    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * vDepth;\n    enc = fract(enc);\n    enc -= enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n    return enc;\n  }\n  \n  void main(void) {\n    gl_FragColor = packDepth(vDepth);\n    //gl_FragColor = vec4(vColor.xyz, vColor.a);\n  }\n";
var LightMapShader = {
    attributes: attributes,
    uniforms: uniforms,
    vertexShaderSource: vertexShaderSource,
    fragmentShaderSource: fragmentShaderSource,
};

var LightMapShaderProcess = /** @class */ (function (_super) {
    __extends(LightMapShaderProcess, _super);
    function LightMapShaderProcess(gl, shader, globalOptions, camera, frameBufferObjs, renderableList, sun) {
        var _this = _super.call(this, gl, shader, globalOptions) || this;
        _this.camera = camera;
        _this.sun = sun;
        _this.frameBufferObjs = frameBufferObjs;
        _this.renderableList = renderableList;
        return _this;
    }
    LightMapShaderProcess.prototype.preprocess = function () { };
    LightMapShaderProcess.prototype.process = function () {
        var _this = this;
        var gl = this.gl;
        var shaderInfo = this.shaderInfo;
        var globalOptions = this.globalOptions;
        this.shader.useProgram();
        gl.viewport(0, 0, 8182, 8182);
        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.camera.fovyRadian, globalOptions.aspect, globalOptions.near, globalOptions.far);
        var orthographicMatrix = mat4.create();
        mat4.ortho(orthographicMatrix, -8192, 8192, -8192, 8192, 0, 8192);
        gl.uniform2fv(shaderInfo.uniformLocations.nearFar, vec2.fromValues(0, 8192));
        var modelViewMatrix = this.sun.getModelViewMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.orthographicMatrix, false, orthographicMatrix);
        this.frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.clear();
        });
        this.renderableList.get().forEach(function (renderableObj) {
            (renderableObj.getId() === undefined) ? renderableObj.createRenderableObjectId(_this.renderableList) : undefined;
            renderableObj.render(gl, shaderInfo, _this.frameBufferObjs);
        });
    };
    LightMapShaderProcess.prototype.postprocess = function () { };
    return LightMapShaderProcess;
}(ShaderProcess));

Math.degree = function (radian) { return radian * 180 / Math.PI; };
Math.radian = function (degree) { return degree * Math.PI / 180; };
Math.randomInt = function () { return Math.round(Math.random() * 10); };
Array.prototype.get = function (index) { return this[this.loopIndex(index)]; };
Array.prototype.getPrev = function (index) { return this[this.loopIndex(index - 1)]; };
Array.prototype.getNext = function (index) { return this[this.loopIndex(index + 1)]; };
Array.prototype.loopIndex = function (index) {
    if (index < 0)
        return index % this.length + this.length;
    else
        return index % this.length;
};
var WebGL = /** @class */ (function () {
    function WebGL(canvas, globalOptions) {
        if (globalOptions === void 0) { globalOptions = {}; }
        this.frameBufferObjs = [];
        this.defaultFrameBufferObjs = [];
        this.lightMapFrameBufferObjs = [];
        this.renderableObjectList = new RenderableObjectList();
        this.shaderProcesses = [];
        this.globalOptions = globalOptions;
        this._canvas = canvas;
        this.init();
    }
    WebGL.prototype.init = function () {
        console.log("Init Start WebGL.");
        var version = "";
        try {
            var canvas = this._canvas;
            if (canvas.getContext("webgl2")) {
                this.gl = canvas.getContext("webgl2");
                version = "webgl2";
            }
            else if (canvas.getContext("webgl")) {
                this.gl = canvas.getContext("webgl");
                version = "webgl";
            }
            if (!this.gl) {
                throw new Error("Unable to initialize WebGL. Your browser may not support it.");
            }
        }
        catch (e) {
            console.log("Unable to initialize WebGL. Your browser may not support it.");
            console.error(e);
        }
        console.log("Init Success " + version);
    };
    WebGL.prototype.checkMultiRenders = function () {
        var ext = this._gl.getExtension('WEBGL_draw_buffers');
        return !ext;
    };
    WebGL.prototype.resizeCanvas = function () {
        var canvas = this.canvas;
        var displayWidth = canvas.clientWidth;
        var displayHeight = canvas.clientHeight;
        var isChanged = (canvas.width !== displayWidth) || (canvas.height !== displayHeight);
        if (isChanged) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            this.frameBufferObjs.forEach(function (frameBufferObj) {
                if (!frameBufferObj.options.isNotInit) {
                    frameBufferObj.init();
                }
            });
            console.log("resizeCanvas");
        }
        this.globalOptions.aspect = (canvas.width / canvas.height);
        return isChanged;
    };
    WebGL.prototype.startRender = function () {
        var gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        this.resizeCanvas();
        this.defaultShader = new Shader(gl);
        if (this.checkMultiRenders()) {
            this.defaultShader.init(DefaultShader);
        }
        this.defaultShaderInfo = this.defaultShader.shaderInfo;
        this.screenShader = new Shader(gl);
        this.screenShader.init(ScreenShader);
        this.screenShaderInfo = this.screenShader.shaderInfo;
        this.lightMapShader = new Shader(gl);
        this.lightMapShader.init(LightMapShader);
        this.lightMapShaderInfo = this.lightMapShader.shaderInfo;
        this.camera = new Camera({ fovyDegree: this.globalOptions.fovyDegree });
        this.sun = new Sun({ position: { x: 0, y: 0, z: 8192 / 2 } });
        this.sun.rotationOrbit(0.5, 0.8, vec3.fromValues(0, 0, 0));
        this.frameBufferObjs.push(this.getMainFbo());
        this.frameBufferObjs.push(this.getAlbedoFbo());
        this.frameBufferObjs.push(this.getSelectionFbo());
        this.frameBufferObjs.push(this.getNormalFbo());
        this.frameBufferObjs.push(this.getDepthFbo());
        this.frameBufferObjs.push(this.getLightMapFbo());
        this.defaultFrameBufferObjs = [];
        this.defaultFrameBufferObjs.push(this.getMainFbo());
        this.defaultFrameBufferObjs.push(this.getAlbedoFbo());
        this.defaultFrameBufferObjs.push(this.getSelectionFbo());
        this.defaultFrameBufferObjs.push(this.getNormalFbo());
        this.defaultFrameBufferObjs.push(this.getDepthFbo());
        this.lightMapFrameBufferObjs.push(this.getLightMapFbo());
        this.shaderProcesses.push(new DefaultShaderProcess(gl, this.defaultShader, this.globalOptions, this.camera, this.defaultFrameBufferObjs, this.renderableObjectList));
        this.shaderProcesses.push(new LightMapShaderProcess(gl, this.lightMapShader, this.globalOptions, this.camera, this.lightMapFrameBufferObjs, this.renderableObjectList, this.sun));
        this.shaderProcesses.push(new ScreenShaderProcess(gl, this.screenShader, this.globalOptions, this.camera, this.frameBufferObjs, this.sun));
        this.shaderProcesses.forEach(function (shaderProcess) {
            shaderProcess.preprocess();
        });
        this.render();
    };
    WebGL.prototype.setOptions = function () {
        this.resizeCanvas();
        this.camera.syncFovyDegree(this.globalOptions.fovyDegree);
        if (this.globalOptions.cullFace) {
            this.gl.enable(this.gl.CULL_FACE);
        }
        else {
            this.gl.disable(this.gl.CULL_FACE);
        }
        if (this.globalOptions.depthTest) {
            this.gl.enable(this.gl.DEPTH_TEST);
        }
        else {
            this.gl.disable(this.gl.DEPTH_TEST);
        }
    };
    WebGL.prototype.render = function () {
        this.scene();
        requestAnimationFrame(this.render.bind(this));
    };
    WebGL.prototype.scene = function () {
        var _this = this;
        this.setOptions();
        this.shaderProcesses.forEach(function (shaderProcess) {
            shaderProcess.process(_this.globalOptions);
        });
        this.shaderProcesses.forEach(function (shaderProcess) {
            shaderProcess.postprocess(_this.globalOptions);
        });
    };
    WebGL.prototype.getMainFbo = function () {
        var textureType = 1;
        var clearColor = vec3.fromValues(0.2, 0.2, 0.2);
        if (!this.mainFbo) {
            this.mainFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "main", textureType: textureType, clearColor: clearColor }, this.globalOptions);
        }
        return this.mainFbo;
    };
    WebGL.prototype.getAlbedoFbo = function () {
        var textureType = 1;
        if (!this.albedoFbo) {
            this.albedoFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "albedo", textureType: textureType }, this.globalOptions);
        }
        return this.albedoFbo;
    };
    WebGL.prototype.getSelectionFbo = function () {
        var textureType = 2;
        if (!this.selectionFbo) {
            this.selectionFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "selection", textureType: textureType }, this.globalOptions);
        }
        return this.selectionFbo;
    };
    WebGL.prototype.getDepthFbo = function () {
        var textureType = 3;
        if (!this.depthFbo) {
            this.depthFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "depth", textureType: textureType }, this.globalOptions);
        }
        return this.depthFbo;
    };
    WebGL.prototype.getNormalFbo = function () {
        var textureType = 4;
        if (!this.normalFbo) {
            this.normalFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, { name: "normal", textureType: textureType }, this.globalOptions);
        }
        return this.normalFbo;
    };
    WebGL.prototype.getLightMapFbo = function () {
        var textureType = 5;
        if (!this.lightMapFbo) {
            this.lightMapFbo = new FrameBufferObject(this.gl, this.canvas, this.defaultShaderInfo, {
                name: "light",
                textureType: textureType,
                width: 8182,
                height: 8182,
            }, this.globalOptions);
        }
        return this.lightMapFbo;
    };
    Object.defineProperty(WebGL.prototype, "gl", {
        get: function () {
            return this._gl;
        },
        set: function (setgl) {
            this._gl = setgl;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGL.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        set: function (setcanvas) {
            this._canvas = setcanvas;
        },
        enumerable: false,
        configurable: true
    });
    return WebGL;
}());

var TextureCoordinator = /** @class */ (function () {
    function TextureCoordinator() {
    }
    TextureCoordinator.calcTextureCoordinate = function (textureSize, texturePosition, pixelWidth) {
        var minWidth = pixelWidth * texturePosition[0];
        var minHeight = pixelWidth * texturePosition[1];
        var maxWidth = pixelWidth * texturePosition[0] + pixelWidth;
        var maxHeight = pixelWidth * texturePosition[1] + pixelWidth;
        if (minWidth < 0 || minHeight < 0 || maxWidth > textureSize[0] || maxHeight > textureSize[1]) {
            throw new Error("incorrect texture coordinate.");
        }
        return vec4.fromValues(minWidth / textureSize[0], minHeight / textureSize[1], maxWidth / textureSize[0], maxHeight / textureSize[1]);
    };
    return TextureCoordinator;
}());

var Cube = /** @class */ (function (_super) {
    __extends(Cube, _super);
    function Cube(options) {
        var _this = _super.call(this) || this;
        _this.init(options);
        return _this;
    }
    Cube.prototype.init = function (options) {
        this.texturePosition = vec2.fromValues(0, 0);
        this.size = vec3.fromValues(128, 128, 128); // size : width, length, height
        this.name = "Untitled Cube";
        if (options === null || options === void 0 ? void 0 : options.name)
            this.name = options.name;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.size)
            this.size = vec3.set(this.size, options.size.width, options.size.length, options.size.height);
        if (options === null || options === void 0 ? void 0 : options.rotation)
            this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if (options === null || options === void 0 ? void 0 : options.texturePosition)
            this.texturePosition = options.texturePosition;
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
    };
    // overriding
    Cube.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var tm = this.getTransformMatrix();
        var rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
        buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
        buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.bind(shaderInfo);
            var textureType = frameBufferObj.textureType;
            if (textureType == 1) {
                gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
                buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
            }
            gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    };
    // overriding
    Cube.prototype.getBuffer = function (gl) {
        if (this.buffer === undefined) {
            this.buffer = new Buffer(gl);
            if (this.texture) {
                this.buffer.texture = this.texture;
                this.textureSize = vec2.fromValues(512, 512);
            }
            var w = this.size[0] / 2;
            var l = this.size[1] / 2;
            var h = this.size[2];
            var color = this.color;
            var p0 = vec3.fromValues(-w, -l, 0);
            var p1 = vec3.fromValues(w, -l, 0);
            var p2 = vec3.fromValues(w, l, 0);
            var p3 = vec3.fromValues(-w, l, 0);
            var p4 = vec3.fromValues(-w, -l, h);
            var p5 = vec3.fromValues(w, -l, h);
            var p6 = vec3.fromValues(w, l, h);
            var p7 = vec3.fromValues(-w, l, h);
            var n0 = this.normal(p0, p2, p1);
            var n1 = this.normal(p0, p3, p2);
            var n2 = this.normal(p4, p5, p6);
            var n3 = this.normal(p4, p6, p7);
            var n4 = this.normal(p3, p0, p4);
            var n5 = this.normal(p3, p4, p7);
            var n6 = this.normal(p1, p2, p6);
            var n7 = this.normal(p1, p6, p5);
            var n8 = this.normal(p0, p1, p5);
            var n9 = this.normal(p0, p5, p4);
            var n10 = this.normal(p2, p3, p7);
            var n11 = this.normal(p2, p7, p6);
            var selectionColor = this.selectionColor;
            this.buffer.positionsVBO = new Float32Array([
                p0[0], p0[1], p0[2],
                p2[0], p2[1], p2[2],
                p1[0], p1[1], p1[2],
                p0[0], p0[1], p0[2],
                p3[0], p3[1], p3[2],
                p2[0], p2[1], p2[2],
                p4[0], p4[1], p4[2],
                p5[0], p5[1], p5[2],
                p6[0], p6[1], p6[2],
                p4[0], p4[1], p4[2],
                p6[0], p6[1], p6[2],
                p7[0], p7[1], p7[2],
                p3[0], p3[1], p3[2],
                p0[0], p0[1], p0[2],
                p4[0], p4[1], p4[2],
                p3[0], p3[1], p3[2],
                p4[0], p4[1], p4[2],
                p7[0], p7[1], p7[2],
                p1[0], p1[1], p1[2],
                p2[0], p2[1], p2[2],
                p6[0], p6[1], p6[2],
                p1[0], p1[1], p1[2],
                p6[0], p6[1], p6[2],
                p5[0], p5[1], p5[2],
                p0[0], p0[1], p0[2],
                p1[0], p1[1], p1[2],
                p5[0], p5[1], p5[2],
                p0[0], p0[1], p0[2],
                p5[0], p5[1], p5[2],
                p4[0], p4[1], p4[2],
                p2[0], p2[1], p2[2],
                p3[0], p3[1], p3[2],
                p7[0], p7[1], p7[2],
                p2[0], p2[1], p2[2],
                p7[0], p7[1], p7[2],
                p6[0], p6[1], p6[2],
            ]);
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
            this.buffer.selectionColorVBO = new Float32Array([
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
            ]);
            var textureCoordinate_1 = TextureCoordinator.calcTextureCoordinate(this.textureSize, this.texturePosition, 16);
            var textureCoordinates_1 = [];
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            var positionCount = this.buffer.positionsVBO.length / 3;
            var indices = new Uint16Array(positionCount);
            this.buffer.indicesVBO = indices.map(function (obj, index) {
                textureCoordinates_1.push(textureCoordinate_1[0]);
                textureCoordinates_1.push(textureCoordinate_1[1]);
                textureCoordinates_1.push(textureCoordinate_1[2]);
                textureCoordinates_1.push(textureCoordinate_1[1]);
                textureCoordinates_1.push(textureCoordinate_1[2]);
                textureCoordinates_1.push(textureCoordinate_1[3]);
                textureCoordinates_1.push(textureCoordinate_1[0]);
                textureCoordinates_1.push(textureCoordinate_1[1]);
                textureCoordinates_1.push(textureCoordinate_1[2]);
                textureCoordinates_1.push(textureCoordinate_1[3]);
                textureCoordinates_1.push(textureCoordinate_1[0]);
                textureCoordinates_1.push(textureCoordinate_1[3]);
                return index;
            });
            this.buffer.textureVBO = new Float32Array(textureCoordinates_1);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
        }
        return this.buffer;
    };
    return Cube;
}(Renderable));

/**
 * Tessellator
 */
var Tessellator = /** @class */ (function () {
    function Tessellator() {
    }
    Tessellator.tessellate = function (positions, isCCW) {
        var _this = this;
        if (isCCW === void 0) { isCCW = true; }
        var result = [];
        var plane = this.validateConvex(positions);
        plane.forEach(function (ConvexPolygon) {
            var triangles = _this.toTriangles(ConvexPolygon, isCCW);
            result = result.concat(triangles);
        });
        return result;
    };
    Tessellator.validateConvex = function (positions, convexs) {
        var _this = this;
        if (convexs === void 0) { convexs = []; }
        if (this.isConvex(positions)) {
            convexs.push(positions);
        }
        else {
            var clockwisePosition_1 = positions.find(function (position, index) { return _this.getPositionNormal(positions, index) < 0; });
            if (clockwisePosition_1 === undefined) {
                return convexs;
            }
            var clockwiseIndex = positions.indexOf(clockwisePosition_1);
            var nearestPositions = this.sortedNearest(positions, clockwiseIndex);
            nearestPositions.some(function (nearestPosition) {
                if (clockwisePosition_1 === undefined) {
                    return convexs;
                }
                var splits = _this.split(positions, clockwisePosition_1, nearestPosition);
                var isIntersection = _this.validateIntersection(positions, clockwisePosition_1, nearestPosition);
                if (isIntersection) {
                    return false;
                }
                var polygonA = _this.validateAngle(splits[0]);
                var polygonB = _this.validateAngle(splits[1]);
                if (polygonA === polygonB) {
                    _this.validateConvex(splits[0], convexs);
                    _this.validateConvex(splits[1], convexs);
                    return true;
                }
            });
        }
        return convexs;
    };
    Tessellator.validateIntersection = function (positions, startPosition, endPosition) {
        var _this = this;
        var intersection = positions.find(function (position, index) {
            var crnt = positions.get(index);
            var next = positions.getNext(index);
            if (_this.intersection(startPosition, endPosition, crnt, next)) {
                return true;
            }
        });
        return intersection !== undefined;
    };
    Tessellator.isConvex = function (positions) {
        var _this = this;
        var cw = positions.find(function (position, index) {
            return (_this.getPositionNormal(positions, index) < 0);
        });
        return cw === undefined;
    };
    Tessellator.toTriangles = function (positions, isCCW) {
        if (isCCW === void 0) { isCCW = true; }
        var length = positions.length;
        var result = [];
        for (var i = 1; i < length - 1; i++) {
            if (isCCW)
                result.push(new Triangle(positions[0], positions[i], positions[i + 1]));
            else
                result.push(new Triangle(positions[0], positions[i + 1], positions[i]));
        }
        return result;
    };
    Tessellator.split = function (positions, positionA, positionB) {
        var positionsA = this.createSplits(positions, positionA, positionB);
        var positionsB = this.createSplits(positions, positionB, positionA);
        return [positionsA, positionsB];
    };
    Tessellator.createSplits = function (positions, startPosition, endPosition) {
        var list = [];
        list.push(startPosition);
        list.push(endPosition);
        var index = positions.indexOf(endPosition);
        for (var i = 0; i < positions.length - 1; i++) {
            var crnt = positions.get(index);
            var next = positions.getNext(index);
            if (next == startPosition || next == endPosition) {
                break;
            }
            else if (!this.compare(crnt, next)) {
                list.push(next);
            }
            index++;
        }
        return list;
    };
    Tessellator.validateCCW = function (positions) {
        var _this = this;
        var sum = 0;
        positions.forEach(function (position, index) {
            var normal = _this.getPositionNormal(positions, index);
            var angle = Math.degree(_this.getAngle(positions, index));
            if (normal >= 0)
                sum += angle;
            else
                sum -= angle;
        });
        return sum;
    };
    Tessellator.validateAngle = function (positions) {
        var _this = this;
        var angleSum = 0;
        var reverseAngleSum = 0;
        positions.forEach(function (position, index) {
            var normal = _this.getPositionNormal(positions, index);
            var angle = Math.degree(_this.getAngle(positions, index));
            if (normal > 0)
                angleSum += angle;
            else
                reverseAngleSum += angle;
        });
        return angleSum > reverseAngleSum;
    };
    Tessellator.getPositionNormal = function (positions, index) {
        var prev = positions.getPrev(index);
        var crnt = positions.get(index);
        var next = positions.getNext(index);
        return this.normal(prev, crnt, next)[2];
    };
    Tessellator.getAngle = function (positions, index) {
        var prev = positions.getPrev(index);
        var crnt = positions.get(index);
        var next = positions.getNext(index);
        var d0 = vec3.subtract(vec3.create(), crnt, prev);
        var d1 = vec3.subtract(vec3.create(), next, crnt);
        return vec3.angle(d0, d1);
    };
    Tessellator.sortedNearest = function (positions, index) {
        var prev = positions.getPrev(index);
        var crnt = positions.get(index);
        var next = positions.getNext(index);
        var filtedPositions = positions.filter(function (position) {
            return !(position == prev || position == crnt || position == next);
        });
        var nearestPositions = filtedPositions.sort(function (a, b) {
            var distanceA = vec3.squaredDistance(crnt, a);
            var distanceB = vec3.squaredDistance(crnt, b);
            if (distanceA < distanceB)
                return -1;
            else if (distanceA > distanceB)
                return 1;
            else
                return 0;
        });
        return nearestPositions;
    };
    Tessellator.intersection = function (a1, a2, b1, b2) {
        var a = vec3.dot(this.cross(a1, a2, b1), this.cross(a1, a2, b2));
        var b = vec3.dot(this.cross(b1, b2, a1), this.cross(b1, b2, a2));
        if (a == 0 && b == 0) {
            return false;
        }
        return a <= 0 && b <= 0;
    };
    Tessellator.compare = function (a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    };
    Tessellator.cross = function (a, b, c) {
        var d0 = vec3.subtract(vec3.create(), b, a);
        var d1 = vec3.subtract(vec3.create(), c, b);
        return vec3.cross(vec3.create(), d0, d1);
    };
    Tessellator.normal = function (a, b, c) {
        var crossed = this.cross(a, b, c);
        return vec3.normalize(crossed, crossed);
    };
    return Tessellator;
}());

var Polygon = /** @class */ (function (_super) {
    __extends(Polygon, _super);
    function Polygon(coordinates, options) {
        var _this = _super.call(this) || this;
        _this.init(coordinates, options);
        return _this;
    }
    Polygon.prototype.init = function (coordinates, options) {
        this.triangles = [];
        this.height = 3.0;
        this.name = "Untitled Polygon";
        if (coordinates)
            this.coordinates = coordinates;
        if (options === null || options === void 0 ? void 0 : options.name)
            this.name = options.name;
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.rotation)
            this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
    };
    Polygon.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var tm = this.getTransformMatrix();
        var rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
        buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
        buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        frameBufferObjs.forEach(function (frameBufferObj) {
            var textureType = frameBufferObj.textureType;
            frameBufferObj.bind(shaderInfo);
            if (textureType == 1) {
                gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
                buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
            }
            gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    };
    // overriding
    Polygon.prototype.getBuffer = function (gl) {
        var _this = this;
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var color_1 = this.color;
            var selectionColor_1 = this.selectionColor;
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            var normals_1 = [];
            var textureCoordinates_1 = [];
            var topPositions = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], _this.height); });
            var bottomPositions = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], 0); });
            var bbox_1 = this.getMinMax(topPositions);
            bbox_1.minz = 0;
            bbox_1.maxz = this.height;
            if (Tessellator.validateCCW(topPositions) < 0) {
                topPositions.reverse();
                bottomPositions.reverse();
            }
            var topTriangles = Tessellator.tessellate(topPositions);
            var bottomTriangles = Tessellator.tessellate(bottomPositions, false);
            var sideTriangles = this.createSideTriangle(topPositions, bottomPositions, true);
            var triangles = [];
            triangles = triangles.concat(topTriangles);
            triangles = triangles.concat(bottomTriangles);
            triangles = triangles.concat(sideTriangles);
            this.triangles = triangles;
            triangles.forEach(function (triangle) {
                var trianglePositions = triangle.positions;
                var normal = triangle.getNormal();
                trianglePositions.forEach(function (position) {
                    position.forEach(function (value) { return positions_1.push(value); });
                    normal.forEach(function (value) { return normals_1.push(value); });
                    color_1.forEach(function (value) { return colors_1.push(value); });
                    selectionColor_1.forEach(function (value) { return selectionColors_1.push(value); });
                    var xoffset = bbox_1.maxx - bbox_1.minx;
                    var yoffset = bbox_1.maxy - bbox_1.miny;
                    var zoffset = bbox_1.maxz - bbox_1.minz;
                    if (normal[0] == 1 || normal[0] == -1) {
                        textureCoordinates_1.push((position[1] - bbox_1.miny) / yoffset);
                        textureCoordinates_1.push((position[2] - bbox_1.minz) / zoffset);
                    }
                    else if (normal[1] == 1 || normal[1] == -1) {
                        textureCoordinates_1.push((position[0] - bbox_1.minx) / xoffset);
                        textureCoordinates_1.push((position[2] - bbox_1.minz) / zoffset);
                    }
                    else if (normal[2] == 1 || normal[2] == -1) {
                        textureCoordinates_1.push((position[0] - bbox_1.minx) / xoffset);
                        textureCoordinates_1.push((position[1] - bbox_1.miny) / yoffset);
                    }
                });
            });
            var indices = new Uint16Array(positions_1.length / 3);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.normalVBO = new Float32Array(normals_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.textureVBO = new Float32Array(textureCoordinates_1);
            if (this.texture) {
                this.buffer.texture = this.texture;
            }
            else if (this.image) {
                this.buffer.texture = this.buffer.createTexture(this.image);
            }
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    };
    Polygon.prototype.createSideTriangle = function (topPositions, bottomPositions, isCCW) {
        if (isCCW === void 0) { isCCW = true; }
        var triangles = [];
        if (topPositions.length != bottomPositions.length) {
            throw new Error("plane length is not matched.");
        }
        var length = topPositions.length;
        for (var i = 0; i < length; i++) {
            var topA = topPositions.getPrev(i);
            var topB = topPositions.get(i);
            var bottomA = bottomPositions.getPrev(i);
            var bottomB = bottomPositions.get(i);
            if (isCCW) {
                triangles.push(new Triangle(topB, topA, bottomA));
                triangles.push(new Triangle(topB, bottomA, bottomB));
            }
            else {
                triangles.push(new Triangle(topB, bottomA, topA));
                triangles.push(new Triangle(topB, bottomB, bottomA));
            }
        }
        return triangles;
    };
    Polygon.prototype.createRandomColor = function () {
        var r = Math.round(Math.random() * 10) / 10;
        var g = Math.round(Math.random() * 10) / 10;
        var b = Math.round(Math.random() * 10) / 10;
        return vec4.fromValues(r, g, b, 1.0);
    };
    return Polygon;
}(Renderable));

var Rectangle = /** @class */ (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(coordinates, options) {
        var _this = _super.call(this) || this;
        _this.init(coordinates, options);
        return _this;
    }
    Rectangle.prototype.init = function (coordinates, options) {
        this.length = 0;
        this.name = "Untitled Rectangle";
        if (options === null || options === void 0 ? void 0 : options.id) {
            this.id = options.id;
            this.selectionColor = this.convertIdToColor(options.id);
        }
        if (coordinates)
            this.coordinates = coordinates;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if ((options === null || options === void 0 ? void 0 : options.image) && !(options === null || options === void 0 ? void 0 : options.texture))
            this.image = options.image;
    };
    Rectangle.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var _this = this;
        var tm = this.getTransformMatrix();
        var rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
        buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
        buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.bind(shaderInfo);
            if (_this.image || _this.texture) {
                gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
                buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
            }
            gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    };
    Rectangle.prototype.getBuffer = function (gl) {
        var _this = this;
        this.dirty = (this.buffer === undefined || this.length != this.coordinates.length);
        if (this.dirty === true) {
            this.buffer = new Buffer(gl);
            var color_1 = this.color;
            var selectionColor_1 = this.selectionColor;
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            var normals_1 = [];
            var textureCoordinates_1 = [];
            var rectanglePositions = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], _this.position[2]); });
            var bbox_1 = this.getMinMax(rectanglePositions);
            var leftTriangle = new Triangle(rectanglePositions[0], rectanglePositions[1], rectanglePositions[2]);
            var rightTriangle = new Triangle(rectanglePositions[0], rectanglePositions[2], rectanglePositions[3]);
            var triangles = [leftTriangle, rightTriangle];
            triangles.forEach(function (triangle) {
                var trianglePositions = triangle.positions;
                var normal = triangle.getNormal();
                trianglePositions.forEach(function (position) {
                    position.forEach(function (value) { positions_1.push(value); });
                    normal.forEach(function (value) { return normals_1.push(value); });
                    color_1.forEach(function (value) { return colors_1.push(value); });
                    selectionColor_1.forEach(function (value) { return selectionColors_1.push(value); });
                    var rangeX = bbox_1.maxx - bbox_1.minx;
                    var rangeY = bbox_1.maxy - bbox_1.miny;
                    textureCoordinates_1.push((position[0] - bbox_1.minx) / rangeX);
                    textureCoordinates_1.push((position[1] - bbox_1.miny) / rangeY);
                });
            });
            this.length = this.coordinates.length;
            var indices = new Uint16Array(positions_1.length / 3);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.normalVBO = new Float32Array(normals_1);
            this.buffer.textureVBO = new Float32Array(textureCoordinates_1);
            if (this.texture) {
                this.buffer.texture = this.texture;
            }
            else if (!this.texture && this.image) {
                var texture = this.buffer.createTexture(this.image);
                this.buffer.texture = texture;
                this.texture = texture;
            }
            this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    };
    return Rectangle;
}(Renderable));

var Point = /** @class */ (function (_super) {
    __extends(Point, _super);
    function Point(options) {
        var _this = _super.call(this) || this;
        _this.init(options);
        return _this;
    }
    Point.prototype.init = function (options) {
        this.name = "Untitled Point";
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
    };
    Point.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var tm = this.getTransformMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        frameBufferObjs.forEach(function (frameBufferObj) {
            var textureType = frameBufferObj.textureType;
            frameBufferObj.bind();
            if (textureType == 4) {
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
                buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
            }
            else {
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
                buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
            }
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
            buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
            gl.disable(gl.DEPTH_TEST);
            gl.drawElements(gl.POINTS, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            gl.enable(gl.DEPTH_TEST);
            frameBufferObj.unbind();
        });
    };
    Point.prototype.getBuffer = function (gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            this.position.forEach(function (value) { return positions_1.push(value); });
            this.color.forEach(function (value) { return colors_1.push(value); });
            this.selectionColor.forEach(function (value) { return selectionColors_1.push(value); });
            var indices = new Uint16Array(positions_1.length);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    };
    return Point;
}(Renderable));

var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(coordinates, options) {
        var _this = _super.call(this) || this;
        _this.init(coordinates, options);
        return _this;
    }
    Line.prototype.init = function (coordinates, options) {
        this.length = 0;
        this.name = "Untitled Line";
        if (coordinates)
            this.coordinates = coordinates;
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
    };
    Line.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var tm = this.getTransformMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        // todo
        gl.disable(gl.DEPTH_TEST);
        gl.drawElements(gl.LINE_STRIP, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
        gl.enable(gl.DEPTH_TEST);
    };
    Line.prototype.getBuffer = function (gl) {
        var _this = this;
        if (this.buffer === undefined || this.length != this.coordinates.length || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            this.coordinates.forEach(function (coordinate) {
                coordinate.forEach(function (value) { return positions_1.push(value); });
                _this.color.forEach(function (value) { return colors_1.push(value); });
                _this.selectionColor.forEach(function (value) { return selectionColors_1.push(value); });
            });
            this.length = this.coordinates.length;
            var indices = new Uint16Array(this.length);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    };
    return Line;
}(Renderable));

var Cylinder = /** @class */ (function (_super) {
    __extends(Cylinder, _super);
    function Cylinder(options) {
        var _this = _super.call(this) || this;
        _this.init(options);
        return _this;
    }
    Cylinder.prototype.init = function (options) {
        this.triangles = [];
        this.radius = 1.0;
        this.height = 3.0;
        this.density = 36;
        this.name = "Untitled Cylinder";
        if (options === null || options === void 0 ? void 0 : options.radius)
            this.radius = options.radius;
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.density)
            this.density = options.density;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.rotation)
            this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
    };
    Cylinder.prototype.rotate = function (xValue, yValue, tm) {
        var pitchAxis = vec3.fromValues(1, 0, 0);
        var pitchMatrix = mat4.fromRotation(mat4.create(), yValue, pitchAxis);
        return mat4.multiply(tm, tm, pitchMatrix);
    };
    Cylinder.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var _this = this;
        var tm = this.getTransformMatrix();
        var rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
        buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
        buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.bind();
            if (_this.image || _this.texture) {
                gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
                buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
            }
            gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    };
    // overriding
    Cylinder.prototype.getBuffer = function (gl) {
        var _this = this;
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var color_1 = this.color;
            var selectionColor_1 = this.selectionColor;
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            var normals_1 = [];
            var textureCoordinates_1 = [];
            this.coordinates = [];
            var angleOffset = (360 / this.density);
            var origin_1 = vec2.fromValues(0.0, 0.0);
            var rotateVec2 = vec2.fromValues(0.0, 0.0 + this.radius);
            for (var i = 0; i < this.density; i++) {
                var angle = Math.radian(i * angleOffset);
                var rotated = vec2.rotate(vec2.create(), rotateVec2, origin_1, angle);
                this.coordinates.push(rotated);
            }
            var topPositions_1 = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], _this.height); });
            var bottomPositions_1 = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], 0.0); });
            var bbox_1 = this.getMinMax(topPositions_1);
            bbox_1.minz = this.position[2];
            bbox_1.maxz = this.position[2] + this.height;
            if (Tessellator.validateCCW(topPositions_1) < 0) {
                topPositions_1.reverse();
                bottomPositions_1.reverse();
            }
            var topOrigin_1 = vec3.fromValues(0.0, 0.0, this.height);
            var topTriangles = topPositions_1.map(function (topPosition, index) {
                var nextPosition = topPositions_1.getNext(index);
                return new Triangle(topOrigin_1, topPosition, nextPosition);
            });
            var bottomOrigin_1 = vec3.fromValues(0.0, 0.0, 0.0);
            var bottomTriangles = bottomPositions_1.map(function (bottomPosition, index) {
                var nextPosition = bottomPositions_1.getNext(index);
                return new Triangle(bottomOrigin_1, nextPosition, bottomPosition);
            });
            var sideTriangles = this.createSideTriangle(topPositions_1, bottomPositions_1, true);
            var triangles = [];
            triangles = triangles.concat(topTriangles);
            triangles = triangles.concat(bottomTriangles);
            triangles = triangles.concat(sideTriangles);
            this.triangles = triangles;
            triangles.forEach(function (triangle) {
                var trianglePositions = triangle.positions;
                var normal = triangle.getNormal();
                trianglePositions.forEach(function (position) {
                    position.forEach(function (value) { return positions_1.push(value); });
                    normal.forEach(function (value) { return normals_1.push(value); });
                    color_1.forEach(function (value) { return colors_1.push(value); });
                    selectionColor_1.forEach(function (value) { return selectionColors_1.push(value); });
                    var xoffset = bbox_1.maxx - bbox_1.minx;
                    var yoffset = bbox_1.maxy - bbox_1.miny;
                    var zoffset = bbox_1.maxz - bbox_1.minz;
                    if (normal[0] == 1 || normal[0] == -1) {
                        textureCoordinates_1.push((position[1] - bbox_1.miny) / yoffset);
                        textureCoordinates_1.push((position[2] - bbox_1.minz) / zoffset);
                    }
                    else if (normal[1] == 1 || normal[1] == -1) {
                        textureCoordinates_1.push((position[0] - bbox_1.minx) / xoffset);
                        textureCoordinates_1.push((position[2] - bbox_1.minz) / zoffset);
                    }
                    else if (normal[2] == 1 || normal[2] == -1) {
                        textureCoordinates_1.push((position[0] - bbox_1.minx) / xoffset);
                        textureCoordinates_1.push((position[1] - bbox_1.miny) / yoffset);
                    }
                });
            });
            var indices = new Uint16Array(positions_1.length);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.normalVBO = new Float32Array(normals_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.textureVBO = new Float32Array(textureCoordinates_1);
            if (this.image) {
                var texture = this.buffer.createTexture(this.image);
                this.buffer.texture = texture;
                this.texture = texture;
            }
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    };
    Cylinder.prototype.createSideTriangle = function (topPositions, bottomPositions, isCCW) {
        if (isCCW === void 0) { isCCW = true; }
        var triangles = [];
        if (topPositions.length != bottomPositions.length) {
            throw new Error("plane length is not matched.");
        }
        var length = topPositions.length;
        for (var i = 0; i < length; i++) {
            var topA = topPositions.getPrev(i);
            var topB = topPositions.get(i);
            var bottomA = bottomPositions.getPrev(i);
            var bottomB = bottomPositions.get(i);
            if (isCCW) {
                triangles.push(new Triangle(topB, topA, bottomA));
                triangles.push(new Triangle(topB, bottomA, bottomB));
            }
            else {
                triangles.push(new Triangle(topB, bottomA, topA));
                triangles.push(new Triangle(topB, bottomB, bottomA));
            }
        }
        return triangles;
    };
    Cylinder.prototype.createRandomColor = function () {
        var r = Math.round(Math.random() * 10) / 10;
        var g = Math.round(Math.random() * 10) / 10;
        var b = Math.round(Math.random() * 10) / 10;
        return vec4.fromValues(r, g, b, 1.0);
    };
    return Cylinder;
}(Renderable));

var Obj = /** @class */ (function (_super) {
    __extends(Obj, _super);
    function Obj(options, objData) {
        var _this = _super.call(this) || this;
        _this.init(options, objData);
        return _this;
    }
    Obj.prototype.init = function (options, objData) {
        this.triangles = [];
        this.radius = 1.0;
        this.height = 3.0;
        this.scale = 1.0;
        this.name = "Untitled OBJ File";
        if (options === null || options === void 0 ? void 0 : options.radius)
            this.radius = options.radius;
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.rotation)
            this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
        if (options === null || options === void 0 ? void 0 : options.scale)
            this.scale = options.scale;
        this.objData = objData;
    };
    Obj.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var _this = this;
        var tm = this.getTransformMatrix();
        var rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
        buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
        buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.bind();
            if (_this.image || _this.texture) {
                gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
                buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
            }
            gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    };
    // overriding
    Obj.prototype.getBuffer = function (gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var color_1 = this.color;
            var selectionColor_1 = this.selectionColor;
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            var normals_1 = [];
            var textureCoordinates = [];
            var coordinates_1 = [];
            var objData = this.objData;
            var scaler_1 = this.scale;
            var triangles_1 = [];
            objData.vertices.forEach(function (vertice) {
                var xyz = vertice.split(" ").filter(function (block) { return block !== ''; });
                var x = parseFloat(xyz[0]) * scaler_1;
                var y = parseFloat(xyz[1]) * scaler_1;
                var z = parseFloat(xyz[2]) * scaler_1;
                coordinates_1.push(vec3.fromValues(x, z, y));
            });
            var allCoordinates_1 = [];
            objData.allVertices.forEach(function (vertice) {
                var xyz = vertice.split(" ").filter(function (block) { return block !== ''; });
                var x = parseFloat(xyz[0]) * scaler_1;
                var y = parseFloat(xyz[1]) * scaler_1;
                var z = parseFloat(xyz[2]) * scaler_1;
                allCoordinates_1.push(vec3.fromValues(x, z, y));
            });
            objData.faces.forEach(function (face) {
                var splitedFaces = face.split(" ").filter(function (block) { return block !== ''; });
                var length = splitedFaces.length;
                if (length >= 3) {
                    var face_1 = splitedFaces.map(function (theIndex) {
                        return parseInt(theIndex.split("/")[0]);
                    });
                    var theCoordinates = face_1.map(function (theIndex) {
                        if (theIndex < 0) {
                            return coordinates_1[coordinates_1.length + theIndex];
                        }
                        else {
                            return allCoordinates_1[theIndex - 1];
                        }
                    });
                    for (var loop = 2; loop < length; loop++) {
                        triangles_1.push(new Triangle(theCoordinates[0], theCoordinates[loop], theCoordinates[loop - 1]));
                        color_1.forEach(function (value) { return colors_1.push(value); });
                        color_1.forEach(function (value) { return colors_1.push(value); });
                        color_1.forEach(function (value) { return colors_1.push(value); });
                    }
                }
            });
            triangles_1.forEach(function (triangle) {
                var trianglePositions = triangle.positions;
                var normal = triangle.getNormal();
                trianglePositions.forEach(function (position) {
                    position.forEach(function (value) { return positions_1.push(value); });
                    normal.forEach(function (value) { return normals_1.push(value); });
                    selectionColor_1.forEach(function (value) { return selectionColors_1.push(value); });
                });
            });
            var indices = new Uint16Array(positions_1.length);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.normalVBO = new Float32Array(normals_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.textureVBO = new Float32Array(textureCoordinates);
            if (this.image) {
                var texture = this.buffer.createTexture(this.image);
                this.buffer.texture = texture;
                this.texture = texture;
            }
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    };
    return Obj;
}(Renderable));

var BatchObject = /** @class */ (function (_super) {
    __extends(BatchObject, _super);
    function BatchObject(options) {
        var _this = _super.call(this) || this;
        _this.init(options);
        return _this;
    }
    BatchObject.prototype.init = function (options) {
        this.name = "Untitled BatchObject";
        this.colors = options.colors;
        this.selectionColors = options.selectionColors;
        this.positions = options.positions;
        this.normals = options.normals;
        this.textures = options.textures;
        this.textureCoordinates = options.textureCoordinates;
    };
    BatchObject.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var tm = this.getTransformMatrix();
        var rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        if (buffer.normalGlBuffer) {
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
            buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        }
        if (buffer.positionsGlBuffer) {
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
            buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        }
        if (buffer.colorGlBuffer) {
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
            buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        }
        if (buffer.selectionColorGlBuffer) {
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
            buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        }
        if (buffer.textureGlBuffer) {
            gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
            buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
        }
        frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.bind();
            if (buffer.indicesLength) {
                gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            }
            frameBufferObj.unbind();
        });
    };
    // overriding
    BatchObject.prototype.getBuffer = function (gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var colors = this.colors;
            var selectionColors = this.selectionColors;
            var positions = this.positions;
            var normals = this.normals;
            var textureCoordinates = this.textureCoordinates;
            var textures = this.textures;
            this.buffer.texture = textures[0];
            var indices = new Uint16Array(positions.length / 3);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions);
            this.buffer.normalVBO = new Float32Array(normals);
            this.buffer.colorVBO = new Float32Array(colors);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors);
            this.buffer.textureVBO = new Float32Array(textureCoordinates);
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    };
    return BatchObject;
}(Renderable));

Float32Array.prototype.concat = function () {
    var bytesPerIndex = 4, buffers = Array.prototype.slice.call(arguments);
    buffers.unshift(this);
    buffers = buffers.map(function (item) {
        if (item instanceof Float32Array) {
            return item.buffer;
        }
        else if (item instanceof ArrayBuffer) {
            if (item.byteLength / bytesPerIndex % 1 !== 0) {
                throw new Error('One of the ArrayBuffers is not from a Float32Array');
            }
            return item;
        }
        else {
            throw new Error('You can only concat Float32Array, or ArrayBuffers');
        }
    });
    var concatenatedByteLength = buffers
        .map(function (a) { return a.byteLength; })
        .reduce(function (a, b) { return a + b; }, 0);
    var concatenatedArray = new Float32Array(concatenatedByteLength / bytesPerIndex);
    var offset = 0;
    buffers.forEach(function (buffer) {
        concatenatedArray.set(new Float32Array(buffer), offset);
        offset += buffer.byteLength / bytesPerIndex;
    });
    return concatenatedArray;
};
var BufferBatch = /** @class */ (function () {
    function BufferBatch() {
    }
    BufferBatch.batch100 = function (gl, renderableObjs) {
        var results = [];
        var unit = 500;
        for (var loop = 0; loop < renderableObjs.length; loop += unit) {
            var result = this.batch(gl, renderableObjs.slice(loop, loop + unit));
            results.push(result);
        }
        return results;
    };
    BufferBatch.batch = function (gl, renderableObjs) {
        var positionsList = [];
        var normalsList = [];
        var colorsList = [];
        var selectionColorsList = [];
        var textureCoordinatesList = [];
        var textureList = [];
        renderableObjs.forEach(function (renderableObj) {
            var position = renderableObj.position;
            var buffer = renderableObj.getBuffer(gl);
            var movedPositions = [];
            if (buffer.positionsVBO) {
                buffer.positionsVBO.forEach(function (VBO, index) {
                    var count = index % 3;
                    if (count == 0) {
                        movedPositions.push(VBO + position[0]);
                    }
                    else if (count == 1) {
                        movedPositions.push(VBO + position[1]);
                    }
                    else {
                        movedPositions.push(VBO + position[2]);
                    }
                });
            }
            positionsList.push(movedPositions);
            if (buffer.normalVBO) {
                normalsList.push(buffer.normalVBO);
            }
            if (buffer.colorVBO) {
                colorsList.push(buffer.colorVBO);
            }
            if (buffer.selectionColorVBO) {
                selectionColorsList.push(buffer.selectionColorVBO);
            }
            if (buffer.textureVBO) {
                textureCoordinatesList.push(buffer.textureVBO);
            }
            if (buffer.texture) {
                textureList.push(buffer.texture);
            }
        });
        var buffer = {
            positions: this.concatFloat32(positionsList),
            normals: this.concatFloat32(normalsList),
            colors: this.concatFloat32(colorsList),
            selectionColors: this.concatFloat32(selectionColorsList),
            textureCoordinates: this.concatFloat32(textureCoordinatesList),
            textures: textureList,
        };
        return new BatchObject(buffer);
    };
    BufferBatch.concatFloat32 = function (floatObjs) {
        if (!floatObjs || floatObjs.length <= 0) {
            console.log("========================");
            return;
        }
        var result = [];
        for (var loop = 0; loop < floatObjs.length; loop++) {
            this.concat(result, floatObjs[loop]);
        }
        return new Float32Array(result);
    };
    BufferBatch.concat = function (target, list) {
        list.forEach(function (data) {
            target.push(data);
        });
    };
    return BufferBatch;
}());

var GeometryLine = /** @class */ (function () {
    function GeometryLine(position, direction) {
        this.position = position;
        this.direction = direction;
    }
    return GeometryLine;
}());

export { BatchObject, Buffer, BufferBatch, Camera, Cube, Cylinder, GeometryLine, GeometryPlane, Line, Obj, Point, Polygon, Rectangle, Shader, Sun, WebGL };
