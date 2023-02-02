"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix");
const Plane_js_1 = __importDefault(require("./Plane.js"));
class Triangle {
    constructor(position1, position2, position3) {
        this.positions = [position1, position2, position3];
        this.getNormal();
    }
    get(index) {
        return this.positions[index];
    }
    getNormal() {
        if (this.normal === undefined) {
            let directionA = gl_matrix_1.vec3.subtract(gl_matrix_1.vec3.create(), this.positions[1], this.positions[0]);
            let directionB = gl_matrix_1.vec3.subtract(gl_matrix_1.vec3.create(), this.positions[2], this.positions[1]);
            let normal = gl_matrix_1.vec3.cross(gl_matrix_1.vec3.create(), directionA, directionB);
            gl_matrix_1.vec3.normalize(normal, normal);
            this.normal = normal;
        }
        return this.normal;
    }
    getPlane() {
        if (!this.plane) {
            this.plane = new Plane_js_1.default(this.positions[0], this.normal);
        }
        return this.plane;
    }
}
exports.default = Triangle;
