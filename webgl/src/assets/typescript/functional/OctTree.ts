import BoundingBox from "./BoundingBox";

export default class OctTree<T> {
  rootNode: OctTree<T>;
  parentNode: OctTree<T>;
  level: number;
  datas: Array<T>;
  children: Array<OctTree<T>>;
  boundindBox: BoundingBox;
  constructor(datas: Array<T>, parent?: OctTree<T>) {
    if (parent) {
      this.initChildren(datas, parent);
    } else {
      this.initRootNode(datas);
    }
  }
  initRootNode(datas: Array<T>) {
    this.rootNode = this;
    this.parentNode = this;
    this.level = 0;
    this.datas = datas;
  }
  initChildren(datas: Array<T>, parent: OctTree<T>) {
    this.rootNode = parent.rootNode;
    this.parentNode = parent;
    let childrenLevel = parent.level + 1;
    this.level = childrenLevel;
    this.datas = datas;
  }
  setChildren(datasList: Array<Array<T>>) {
    if (datasList.length != 8) {
      throw new Error("Octtree should receive eight data lists.");
    }
    this.children = [];
    datasList.forEach((datas) => {
      let node = new OctTree(datas, this);
      this.children.push(node);
    })
  }
  forEach(callback: (value: OctTree<T>, index?: number) => void) {
    this.children.forEach(callback);
  }
}