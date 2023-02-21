import { vec3, vec4 } from 'gl-matrix';
export default class Face {
    constructor(...vertices) {
        this.vertices = [];
        vertices.forEach((vertex) => {
            this.vertices.push(vertex);
        });
        this.auto();
    }
    get(index) {
        return this.vertices[index];
    }
    getVertices() {
        return this.vertices;
    }
    auto() {
        const vertices = this.vertices;
        for (let loop = 0; loop < vertices.length; loop++) {
            let prev = vertices.getPrev(loop);
            let crnt = vertices.get(loop);
            let next = vertices.getNext(loop);
            if (!crnt.normal) {
                //console.warn("vertex dosn't have normal.");
                crnt.normal = Face.calcNormal(prev.position, crnt.position, next.position);
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
}
