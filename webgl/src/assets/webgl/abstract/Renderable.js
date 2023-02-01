"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix"); // eslint-disable-line no-unused-vars
class Renderable {
    constructor() {
        if (this.constructor === Renderable) {
            throw new Error("Renderable is abstract class. Created an instance of an abstract class.");
        }
        this.name = "Untitled";
        this.position = gl_matrix_1.vec3.fromValues(0, 0, 0);
        this.rotation = gl_matrix_1.vec3.fromValues(0, 0, 0);
        this.color = gl_matrix_1.vec4.fromValues(0.4, 0.4, 0.4, 1);
        this.selectionColor = gl_matrix_1.vec4.fromValues(0.0, 0.0, 0.0, 1);
        this.dirty = false;
    }
    // eslint-disable-next-line no-unused-vars
    render(gl, shaderInfo, frameBufferObjs) {
        throw new Error("render() is abstract method. Abstract methods must be overriding.");
    }
    // eslint-disable-next-line no-unused-vars
    getBuffer(gl) {
        throw new Error("render() is abstract method. Abstract methods must be overriding.");
    }
    getTransformMatrix() {
        if (!this.transformMatrix || this.dirty === true) {
            let tm = gl_matrix_1.mat4.create();
            gl_matrix_1.mat4.identity(tm);
            gl_matrix_1.mat4.rotate(tm, tm, Math.radian(this.rotation[1]), gl_matrix_1.vec3.fromValues(0, 1, 0));
            gl_matrix_1.mat4.rotate(tm, tm, Math.radian(this.rotation[2]), gl_matrix_1.vec3.fromValues(0, 0, 1));
            gl_matrix_1.mat4.rotate(tm, tm, Math.radian(this.rotation[0]), gl_matrix_1.vec3.fromValues(1, 0, 0));
            tm[12] = this.position[0];
            tm[13] = this.position[1];
            tm[14] = this.position[2];
            this.transformMatrix = tm;
        }
        return this.transformMatrix;
    }
    getRotationMatrix() {
        if (!this.rotationMatrix || this.dirty === true) {
            this.rotationMatrix = gl_matrix_1.mat4.clone(this.getTransformMatrix());
            this.rotationMatrix[12] = 0;
            this.rotationMatrix[13] = 0;
            this.rotationMatrix[14] = 0;
        }
        return this.rotationMatrix;
    }
    getId() {
        return this.id;
    }
    calcNormal(pa, pb, pc) {
        let d0 = gl_matrix_1.vec3.create();
        let d1 = gl_matrix_1.vec3.create();
        d0 = gl_matrix_1.vec3.subtract(d0, pb, pa);
        d1 = gl_matrix_1.vec3.subtract(d1, pc, pb);
        let normal = gl_matrix_1.vec3.create();
        gl_matrix_1.vec3.cross(normal, d0, d1);
        gl_matrix_1.vec3.normalize(normal, normal);
        return normal;
    }
    intersection(a1, a2, b1, b2) {
        let a = this.dot(this.cross(a1, a2, b1), this.cross(a1, a2, b2));
        let b = this.dot(this.cross(b1, b2, a1), this.cross(b1, b2, a2));
        return a <= 0 && b <= 0;
    }
    cross(a, b, c) {
        let d0 = gl_matrix_1.vec3.subtract(gl_matrix_1.vec3.create(), b, a);
        let d1 = gl_matrix_1.vec3.subtract(gl_matrix_1.vec3.create(), c, b);
        return gl_matrix_1.vec3.cross(gl_matrix_1.vec3.create(), d0, d1);
    }
    dot(a, b) {
        return gl_matrix_1.vec3.dot(a, b);
    }
    normal(a, b, c) {
        let crossed = this.cross(a, b, c);
        return gl_matrix_1.vec3.normalize(crossed, crossed);
    }
    getMinMax(positions) {
        let minx = Number.MAX_SAFE_INTEGER;
        let miny = Number.MAX_SAFE_INTEGER;
        let maxx = Number.MIN_SAFE_INTEGER;
        let maxy = Number.MIN_SAFE_INTEGER;
        positions.forEach((position) => {
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
    }
    convertIdToColor(id = this.id) {
        const calc = (value, div) => Math.floor(value / div) % 256 / 255;
        return gl_matrix_1.vec4.fromValues(calc(id, 16777216), calc(id, 65536), calc(id, 256), calc(id, 1));
    }
    convertColorToId(color) {
        return (color[0] * 16777216) + (color[1] * 65536) + (color[2] * 256) + (color[3]);
    }
    createRenderableObjectId(renderableList) {
        let result = this.id;
        while (result === undefined) {
            const ID_RANGE = 10000000;
            let randomId = Math.ceil(Math.random() * ID_RANGE);
            let obj = renderableList.get().find((renderableObj) => {
                return renderableObj.id == randomId;
            });
            if (!obj) {
                result = randomId;
                this.id = randomId;
                this.selectionColor = this.convertIdToColor(randomId);
            }
        }
        return result;
    }
}
exports.default = Renderable;
