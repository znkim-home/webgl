import { vec3 } from 'gl-matrix';
import GeometryPlane from './GeometryPlane.js';
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
export default Triangle;
