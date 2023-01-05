const { mat2, mat3, mat4, vec2, vec3, vec4 } = self.glMatrix; // eslint-disable-line no-unused-vars
import Triangle from '../geometry/Triangle.js';

/**
 * Tessellator
 */
export default class Tessellator {
    /*static tessellate(positions) {
        return this.validateConvex(positions);
    }*/
    static tessellate(positions, isCCW = true) {
        let result = [];
        let plane = this.validateConvex(positions);
        plane.forEach((ConvexPolygon) => {
            let triangles = this.toTriangles(ConvexPolygon, isCCW);
            result = result.concat(triangles);
        })
        return result;
    }
    static validateConvex(positions, convexs = []) {
        if (this.isConvex(positions)) {
            convexs.push(positions);
        } else {
            let clockwisePosition = positions.find((position, index) => this.getPositionNormal(positions, index) < 0);
            let clockwiseIndex = positions.indexOf(clockwisePosition);
            let nearestPositions = this.sortedNearest(positions, clockwiseIndex);
            nearestPositions.some((nearestPosition) => {
                let splits = this.split(positions, clockwisePosition, nearestPosition);

                let isIntersection = this.validateIntersection(positions, clockwisePosition, nearestPosition);
                //console.log(isIntersection);
                if (isIntersection) {
                    return false;
                }

                let polygonA = this.validateAngle(splits[0]); 
                let polygonB = this.validateAngle(splits[1]);
                if (polygonA ^ polygonB == 0) {
                    this.validateConvex(splits[0], convexs);
                    this.validateConvex(splits[1], convexs);
                    return true;
                }
            })
        }
        return convexs;
    }
    static validateIntersection(positions, startPosition, endPosition) {
        let intersection = positions.find((position, index) => {
            let crnt = positions.get(index);
            let next = positions.getNext(index);
            if (this.intersection(startPosition, endPosition, crnt, next)) {
                return true;
            }
        });
        return intersection !== undefined;
    }
    static isConvex(positions) {
        let cw = positions.find((position, index) => {
            return (this.getPositionNormal(positions, index) < 0);
        });
        return cw === undefined;
    }
    static toTriangles(positions, isCCW = true) {
        let length = positions.length;
        //if (length < 3) throw new Error("Position count is not available.");
        var result = [];
        for (let i = 1; i < length - 1; i++) {
            if (isCCW) result.push(new Triangle(positions[0], positions[i], positions[i + 1]));
            else result.push(new Triangle(positions[0], positions[i + 1], positions[i]));
        }
        return result;
    }
    static split(positions, positionA, positionB) {
        let positionsA = this.createSplits(positions, positionA, positionB);
        let positionsB = this.createSplits(positions, positionB, positionA);
        return [positionsA, positionsB];
    }
    static createSplits(positions, startPosition, endPosition) {
        let list = [];
        list.push(startPosition);
        list.push(endPosition);
        let index = positions.indexOf(endPosition);
        for (let i = 0; i < positions.length - 1; i++) {
            let crnt = positions.get(index);
            let next = positions.getNext(index);
            if (next == startPosition || next == endPosition) {
                break;
            } else if (!this.compare(crnt, next)) {
                list.push(next);
            }
            index++;
        }
        return list;
    }
    static validateCCW(positions) {
        let sum = 0;
        positions.forEach((position, index) => {
            let normal = this.getPositionNormal(positions, index);
            let angle = Math.degree(this.getAngle(positions, index));
            if (normal >= 0) sum += angle;
            else sum -= angle;
        });
        return sum;
    }
    static validateAngle(positions) {
        let angleSum = 0;
        let reverseAngleSum = 0;
        positions.forEach((position, index) => {
            let normal = this.getPositionNormal(positions, index);
            let angle = Math.degree(this.getAngle(positions, index));
            if (normal > 0) angleSum += angle;
            else reverseAngleSum += angle;
        });
        return angleSum > reverseAngleSum;
    }
    static getPositionNormal(positions, index) {
        let prev = positions.getPrev(index);
        let crnt = positions.get(index);
        let next = positions.getNext(index);
        return this.normal(prev, crnt, next)[2];
    }
    static getAngle(positions, index) {
        let prev = positions.getPrev(index);
        let crnt = positions.get(index);
        let next = positions.getNext(index);
        let d0 = vec3.subtract(vec3.create(), crnt, prev);
        let d1 = vec3.subtract(vec3.create(), next, crnt);
        return vec3.angle(d0, d1);
    }
    static sortedNearest(positions, index) {
        let prev = positions.getPrev(index);
        let crnt = positions.get(index);
        let next = positions.getNext(index);
        let filtedPositions = positions.filter((position) => {
            return !(position == prev || position == crnt || position == next);
        });
        let nearestPositions = filtedPositions.sort((a, b) => {
            let distanceA = vec3.squaredDistance(crnt, a);
            let distanceB = vec3.squaredDistance(crnt, b);
            if (distanceA < distanceB) return -1;
            else if (distanceA > distanceB) return 1;
            else return 0;
        });
        return nearestPositions;
    }
    static intersection(a1, a2, b1, b2) {
        let a = this.dot(this.cross(a1, a2, b1), this.cross(a1, a2, b2));
        let b = this.dot(this.cross(b1, b2, a1), this.cross(b1, b2, a2));
        if (a == 0 && b == 0) {
            return false;
        }
        return a <= 0 && b <= 0;
    }
    static compare(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    }
    static cross(a, b, c) {
        let d0 = vec3.subtract(vec3.create(), b, a);
        let d1 = vec3.subtract(vec3.create(), c, b);
        return vec3.cross(vec3.create(), d0, d1);
    }
    static dot(a, b) {
        return vec3.dot(a, b);
    }
    static normal(a, b, c) {
        let crossed = this.cross(a, b, c);
        return vec3.normalize(crossed, crossed);
    }
}