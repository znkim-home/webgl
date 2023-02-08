export default class RenderableObjectList {
    constructor() {
        this.init();
    }
    init() {
        this.renderableObjects = [];
    }
    findById(id) {
        return this.renderableObjects.find((renderableObject) => {
            return renderableObject.id === id;
        });
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
    /*remove(id: number): any {
      let finded = this.findById(id);
      if (finded !== undefined && finded.length > 0) {
        let index = this.renderableObjects.indexOf(finded[0]);
        this.renderableObjects.splice(index, 1);
      }
    }*/
    removeAll() {
        this.renderableObjects.length = 0;
    }
}
