import { vec3 } from 'gl-matrix';
export default class Triangle {
    constructor(verticeA, verticeB, verticeC) {
        this.vertices = [verticeA, verticeB, verticeC];
        this.calcNormal();
    }
    get(index) {
        return this.vertices[index];
    }
    getA() {
        return this.vertices[0];
    }
    getB() {
        return this.vertices[1];
    }
    getC() {
        return this.vertices[2];
    }
    calcNormal(isCw) {
        let vertices = this.vertices;
        if (this.normal === undefined) {
            let directionA = vec3.subtract(vec3.create(), vertices[0].position, vertices[1].position);
            let directionB = vec3.subtract(vec3.create(), vertices[1].position, vertices[2].position);
            if (isCw) {
                let normal = vec3.cross(vec3.create(), directionB, directionA);
                this.normal = vec3.normalize(normal, normal);
            }
            else {
                let normal = vec3.cross(vec3.create(), directionA, directionB);
                this.normal = vec3.normalize(normal, normal);
            }
            this.vertices.forEach((vertex) => {
                vertex.normal = this.normal;
            });
        }
        return this.normal;
    }
    get length() {
        return this.vertices.length;
    }
    validate() {
        let vertices = this.vertices;
        let samePosition = vec3.equals(vertices[0].position, vertices[1].position) || vec3.equals(vertices[0].position, vertices[2].position) || vec3.equals(vertices[1].position, vertices[2].position);
        return !samePosition;
    }
}
