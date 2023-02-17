import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

import Triangle from '../topology/Triangle.js';
import Vertex from '../topology/Vertex.js';
import Vertices from '../topology/Vertices.js';
import VerticesList from '../topology/VerticesList.js';
import Indices from '../topology/Indices.js';

/**
 * Tessellator
 */
export default class Tessellator {
    static tessellate(vertices: Vertices): VerticesList {
        let bbox: vec4 = this.getBbox(vertices);
        let result: VerticesList = new VerticesList();
        let plane = this.validateConvex(vertices);
        plane.forEach((ConvexPolygon) => {
            let vertices = ConvexPolygon;
            vertices.forEach((vertex) => {
                let position = vertex.position;
                let relPosition = vec2.fromValues((bbox[2] - position[0]), (bbox[3] - position[1]));
                let relMaxPosition = vec2.fromValues((bbox[2] - bbox[0]), (bbox[3] - bbox[1]));
                vertex.textureCoordinate = vec2.fromValues((relPosition[0] / relMaxPosition[0]), 1 - (relPosition[1] / relMaxPosition[1]));
            })
            result.push(vertices);
        })
        return result;
    }
    static getBbox(vertices: Vertices): vec4 {
        let minX = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;
        vertices.forEach((vertex) => {
            let x = vertex.position[0];
            let y = vertex.position[1];
            minX = minX > x ? x : minX;
            maxX = maxX < x ? x : maxX;
            minY = minY > y ? y : minY;
            maxY = maxY < y ? y : maxY;
        });
        return vec4.fromValues(minX, minY, maxX, maxY);
    }
    static validateConvex(vertices: Vertices, convexs: Array<Vertices> = []): Array<Vertices> {
        if (this.isConvex(vertices)) {
            convexs.push(vertices);
        } else {
            let clockwisePosition: Vertex | undefined = vertices.vertices.find((vertex, index) => this.getPositionNormal(vertices, index) < 0);
            if (clockwisePosition === undefined) {
                return convexs;
            }
            let clockwiseIndex = vertices.vertices.indexOf(clockwisePosition);
            let nearestPositions = this.sortedNearest(vertices, clockwiseIndex);
            nearestPositions.some((nearestPosition) => {
                if (clockwisePosition === undefined) {
                    return convexs;
                }
                let splits: Array<Vertices> = this.split(vertices, clockwisePosition, nearestPosition);

                let isIntersection = this.validateIntersection(vertices, clockwisePosition, nearestPosition);
                if (isIntersection) {
                    return false;
                }

                let polygonA = this.validateAngle(splits[0]); 
                let polygonB = this.validateAngle(splits[1]);
                if (polygonA === polygonB) {
                    this.validateConvex(splits[0], convexs);
                    this.validateConvex(splits[1], convexs);
                    return true;
                }
            })
        }
        return convexs;
    }
    static validateIntersection(vertices: Vertices, startVertex: Vertex, endVertex: Vertex): boolean {
        let intersection = vertices.vertices.find((vertex, index) => {
            let crnt = vertices.get(index);
            let next = vertices.getNext(index);
            if (this.intersection(startVertex.position, endVertex.position, crnt.position, next.position)) {
                return true;
            }
        });
        return intersection !== undefined;
    }
    static isConvex(vertices: Vertices) {
        let originNormal = this.getPositionNormal(vertices, 0);
        let cw = vertices.vertices.find((vertex, index) => {
            return (originNormal != this.getPositionNormal(vertices, index));
        });
        return cw === undefined;
    }
    static split(vertices: Vertices, vertexA: Vertex, vertexB: Vertex): Array<Vertices> {
        let verticesA: Vertices = this.createSplits(vertices, vertexA, vertexB);
        let verticesB: Vertices = this.createSplits(vertices, vertexB, vertexA);
        return [verticesA, verticesB];
    }
    static createSplits(vertices: Vertices, startPosition: Vertex, endPosition: Vertex): Vertices {
        let list = new Vertices();
        list.push(startPosition);
        list.push(endPosition);
        let index = vertices.vertices.indexOf(endPosition);
        for (let i = 0; i < vertices.length - 1; i++) {
            let crnt = vertices.get(index);
            let next = vertices.getNext(index);
            if (next == startPosition || next == endPosition) {
                break;
            } else if (!this.compare(crnt.position, next.position)) {
                list.push(next);
            }
            index++;
        }
        list.isCW = vertices.isCW;
        return list;
    }
    static validateCCW(vertices: Vertices): number {
        let sum = 0;
        vertices.forEach((vertex, index) => {
            let normal = this.getPositionNormal(vertices, index);
            let angle = Math.degree(this.getAngle(vertices, index));
            if (normal >= 0) sum += angle;
            else sum -= angle;
        });
        return sum;
    }
    static validateAngle(vertices: Vertices): boolean {
        let angleSum = 0;
        let reverseAngleSum = 0;
        vertices.forEach((vertex: Vertex, index) => {
            let normal = this.getPositionNormal(vertices, index);
            let angle = Math.degree(this.getAngle(vertices, index));
            if (normal > 0) angleSum += angle;
            else reverseAngleSum += angle;
        });
        return angleSum > reverseAngleSum;
    }
    static getPositionNormal(vertices: Vertices, index: number): number{
        let prev: Vertex = vertices.getPrev(index);
        let crnt: Vertex = vertices.get(index);
        let next: Vertex = vertices.getNext(index);
        return this.normal(prev.position, crnt.position, next.position)[2];
    }
    static getAngle(vertices: Vertices, index: number) {
        let prev = vertices.getPrev(index);
        let crnt = vertices.get(index);
        let next = vertices.getNext(index);
        let d0 = vec3.subtract(vec3.create(), crnt.position, prev.position);
        let d1 = vec3.subtract(vec3.create(), next.position, crnt.position);
        return vec3.angle(d0, d1);
    }
    static sortedNearest(vertices: Vertices, index: number) {
        let prev = vertices.getPrev(index);
        let crnt = vertices.get(index);
        let next = vertices.getNext(index);
        let filtedPositions = vertices.vertices.filter((vertex) => {
            return !(vertex == prev || vertex == crnt || vertex == next);
        });
        let nearestPositions = filtedPositions.sort((a, b) => {
            let distanceA = vec3.squaredDistance(crnt.position, a.position);
            let distanceB = vec3.squaredDistance(crnt.position, b.position);
            if (distanceA < distanceB) return -1;
            else if (distanceA > distanceB) return 1;
            else return 0;
        });
        return nearestPositions;
    }
    static intersection(a1: vec3, a2: vec3, b1: vec3, b2: vec3) {
        let a = vec3.dot(this.cross(a1, a2, b1), this.cross(a1, a2, b2));
        let b = vec3.dot(this.cross(b1, b2, a1), this.cross(b1, b2, a2));
        if (a == 0 && b == 0) {
            return false;
        }
        return a <= 0 && b <= 0;
    }
    static compare(a: vec3, b: vec3) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    }
    static cross(a: vec3, b: vec3, c: vec3) {
        let d0 = vec3.subtract(vec3.create(), b, a);
        let d1 = vec3.subtract(vec3.create(), c, b);
        return vec3.cross(vec3.create(), d0, d1);
    }
    static normal(a: vec3, b: vec3, c: vec3) : vec3{
        let crossed = this.cross(a, b, c);
        return vec3.normalize(crossed, crossed);
    }
}