import MapTile from "../renderable/MapTile";
import Renderable from "../abstract/Renderable";
import RenderableObjectList from "./RenderableObjectList";
import OctTree from "./OctTree";

export default class WebMapTileService {
  url: string;
  renderableObjectList: RenderableObjectList;
  constructor(url: string, renderableObjectList: RenderableObjectList) {
    this.url = url;
    this.renderableObjectList = renderableObjectList;
    this.test(3);
  }
  test(wmsLevel: number) {
    let qt = new OctTree<Renderable>([]);
    qt.setChildren([[],[],[],[],[],[],[],[]]);
    qt.forEach((child) => {
      console.log(child);
    })
    console.log(qt);
    let level = wmsLevel;
    let levelPow = Math.pow(2, level);
    let latOffset = 180 / levelPow;
    let lonOffset = 360 / levelPow;
    for (let x = 0; x < levelPow; x++) {
      for (let y = 0; y < levelPow; y++) {
        let latitudeMin = (latOffset * y) - 90;
        let latitudeMax = (latOffset * (y + 1)) - 90;
        let longitudeMin = (lonOffset * x) - 180;
        let longitudeMax = (lonOffset * (x + 1)) - 180;
        let lonlatRange = {latitudeMin, latitudeMax, longitudeMin, longitudeMax}
        let image = new Image(); 
        image.crossOrigin = "";
        image.onload = () => {
          let options = {
            position: { x: 0, y: 0, z: 0 },
            color: { r: 1.0, g: 1.0, b: 0.0, a: 1.0 },
            image : image,
            rotation: {pitch: 0, roll: 0, heading: 0},
            lonlatRange : lonlatRange
          }
          let tile = new MapTile(options);
          this.renderableObjectList.push(tile);
        }
        image.src = `${this.url}${level}/${y}/${x}`
      }
    }
  }
}