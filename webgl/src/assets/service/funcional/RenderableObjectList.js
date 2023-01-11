export default class RenderableObjectList {
  renderableObjects;
  constructor() {
    this.init();
  }
  init() {
    this.renderableObjects = [];
  }
  set(renderableObjects) {
    this.renderableObjects = renderableObjects;
  }
  get() {
    return this.renderableObjects;
  }
  push(renderableObject) {
    this.renderableObjects.push(renderableObject);
  }
  pop() {
    return this.renderableObjects.pop();
  }
  removeAll() {
    this.renderableObjects.length = 0;
  }
}