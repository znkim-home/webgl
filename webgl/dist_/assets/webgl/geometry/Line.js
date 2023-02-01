import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
export default class Line {
    constructor(pos, dir) {
        this.position = pos;
        this.direction = dir;
    }
}
