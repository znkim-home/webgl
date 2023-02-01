import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
export default class ObjFileLoader {
    constructor(url) {
        this.load(url);
    }
    load(url) {
        fetch(url).then((response) => {
            return response.text();
        }).then((data) => {
            console.log(data);
        });
    }
}
