export default class RenderableObjectList {
  renderableObjects: Array<any>;
  length: number;
  constructor() {
    this.init();
  }
  init(): void {
    this.renderableObjects = [];
  }
  findById(id: number): Array<any> {
    return this.renderableObjects.find((renderableObject) => {
      return renderableObject.id === id;
    });
  }
  public set(renderableObjects: Array<any>): void {
    this.renderableObjects = renderableObjects;
  }
  public get(): Array<any> {
    return this.renderableObjects;
  }
  push(renderableObject: any): void {
    this.renderableObjects.push(renderableObject);
  }
  pop(): any {
    return this.renderableObjects.pop();
  }
  size(): number {
    return this.renderableObjects.length;
  }
  /*remove(id: number): any {
    let finded = this.findById(id);
    if (finded !== undefined && finded.length > 0) {
      let index = this.renderableObjects.indexOf(finded[0]);
      this.renderableObjects.splice(index, 1);
    }
  }*/
  removeAll(): void {
    this.renderableObjects.length = 0;
  }
}