"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix"); // eslint-disable-line no-unused-vars
class Plane {
    constructor(position, normal) {
        this.set(position, normal);
    }
    set(position, normal) {
        this.normal = normal;
        this.position = position;
        this.distance = -(normal[0] * position[0] + normal[1] * position[1] + normal[2] * position[2]);
    }
    getIntersection(line) {
        let normal = this.normal;
        let position = line.position;
        let direction = line.direction;
        let test = (normal[0] * direction[0]) + (normal[1] * direction[1]) + (normal[2] * direction[2]);
        if (Math.abs(test) > Number.MIN_VALUE) {
            let lambda = -((normal[0] * position[0] + normal[1] * position[1] + normal[2] * position[2] + this.distance) / test);
            let x = position[0] + lambda * direction[0];
            let y = position[1] + lambda * direction[1];
            let z = position[2] + lambda * direction[2];
            return gl_matrix_1.vec3.fromValues(x, y, z);
        }
        else {
            return null;
        }
    }
}
exports.default = Plane;
