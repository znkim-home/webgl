import { vec3 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
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
export default GeometryPlane;
