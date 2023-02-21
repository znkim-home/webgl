import { vec3, vec4 } from 'gl-matrix';
export default class Vertices {
    constructor(vertices, isCW) {
        this.isCW = isCW ? true : false;
        this.vertices = [];
        if (vertices) {
            vertices.forEach((vertex) => {
                this.vertices.push(vertex);
            });
        }
    }
    forEach(callback) {
        this.vertices.forEach(callback);
    }
    push(vertex) {
        this.vertices.push(vertex);
    }
    pop() {
        return this.vertices.pop();
    }
    get(index) {
        return this.vertices[index];
    }
    getNext(index) {
        return this.vertices.getNext(index);
    }
    getPrev(index) {
        return this.vertices.getPrev(index);
    }
    getNextIndex(index) {
        return this.vertices.getNextIndex(index);
    }
    getPrevIndex(index) {
        return this.vertices.getPrevIndex(index);
    }
    auto() {
        const vertices = this.vertices;
        for (let loop = 0; loop < vertices.length; loop++) {
            let prev = vertices.getPrev(loop);
            let crnt = vertices.get(loop);
            let next = vertices.getNext(loop);
            if (!crnt.normal) {
                crnt.normal = Vertices.calcNormal(prev.position, crnt.position, next.position);
                //console.log(crnt.normal);
            }
            if (!crnt.color) {
                crnt.color = vec4.fromValues(0.5, 0.5, 0.5, 1.0);
            }
        }
    }
    static calcNormal(prev, crnt, next) {
        let directionA = vec3.subtract(vec3.create(), crnt, prev);
        let directionB = vec3.subtract(vec3.create(), next, crnt);
        let normal = vec3.cross(vec3.create(), directionA, directionB);
        return vec3.normalize(normal, normal);
    }
    get length() {
        return this.vertices.length;
    }
    set length(value) {
        this.vertices.length = value;
    }
}
