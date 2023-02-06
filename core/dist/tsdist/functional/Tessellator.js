import { vec3 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import Triangle from '@/geometry/Triangle.js';
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
export default Tessellator;
