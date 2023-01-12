export default class RenderableObjectList {
  renderableObjects;
  length;
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
  size() {
    return this.renderableObjects.length;
  }
  removeAll() {
    this.renderableObjects.length = 0;
  }
}