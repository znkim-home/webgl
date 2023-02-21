import { vec3 } from 'gl-matrix';
import GeometryPlane from './GeometryPlane.js';
export default class Triangle {
    constructor(position1, position2, position3) {
        this.textureCoorinates = [];
        this.positions = [position1, position2, position3];
        this.getNormal();
    }
    get(index) {
        return this.positions[index];
    }
    getNormal() {
        if (this.normal === undefined) {
            let directionA = vec3.subtract(vec3.create(), this.positions[1], this.positions[0]);
            let directionB = vec3.subtract(vec3.create(), this.positions[2], this.positions[1]);
            let normal = vec3.cross(vec3.create(), directionA, directionB);
            vec3.normalize(normal, normal);
            this.normal = normal;
        }
        return this.normal;
    }
    getPlane() {
        if (!this.plane) {
            this.plane = new GeometryPlane(this.positions[0], this.normal);
        }
        return this.plane;
    }
}
