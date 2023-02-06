import { mat4, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
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
export default Renderable;
