export default class Model {
  modelMatrix = undefined;

  constructor(vec3) {
    this.init();
    this.setPosition(vec3);
  }

  init () {
    const mat4 = self.glMatrix.mat4;
    const modelMatrix = mat4.create();
    this.modelMatrix = modelMatrix;
  }

  setPosition(vec3) {
    const mat4 = self.glMatrix.mat4;
    const modelMatrix = this.modelMatrix;
    return mat4.translate(modelMatrix, modelMatrix, vec3);
  }

  setScale(vec3) {
    const mat4 = self.glMatrix.mat4;
    const modelMatrix = this.modelMatrix;
    return mat4.scale(modelMatrix, modelMatrix, vec3);
  }

  setRotation(velocity, direction) {
    velocity = velocity || 0;
    direction = direction || [0, 0, 0];
    const mat4 = self.glMatrix.mat4;
    const modelMatrix = this.modelMatrix;
    return mat4.rotate(modelMatrix, modelMatrix, velocity, direction);
  }
}