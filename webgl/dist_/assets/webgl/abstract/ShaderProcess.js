import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
class ShaderProcess {
    constructor(gl, shader) {
        let privateGl = gl;
        let privateShader = shader;
        this.getGl = () => {
            return privateGl;
        };
        this.getCanvas = () => {
            return privateGl.canvas;
        };
        this.getShader = () => {
            return privateShader;
        };
        this.getShaderInfo = () => {
            return privateShader.shaderInfo;
        };
    }
    preprocess() {
        throw new Error("preprocess() is abstract method. Abstract methods must be overriding.");
    }
    process() {
        throw new Error("process() is abstract method. Abstract methods must be overriding.");
    }
    postprocess() {
        throw new Error("postprocess() is abstract method. Abstract methods must be overriding.");
    }
}
export default ShaderProcess;
