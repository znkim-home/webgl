import { vec3 } from 'gl-matrix';
export default class BoundingBox {
  origin: vec3;
  minimumX: number;
  minimumY: number;
  minimumZ: number;
  maximumX: number;
  maximumY: number;
  maximumZ: number;
  constructor(positions: Array<vec3>) {
    this.init();
    this.calcBoundary(positions);
  }
  init(): void {
    this.origin = vec3.fromValues(0, 0, 0);
    this.minimumX = Number.MAX_SAFE_INTEGER;
    this.minimumY = Number.MAX_SAFE_INTEGER;
    this.minimumZ = Number.MAX_SAFE_INTEGER;
    this.maximumX = Number.MIN_SAFE_INTEGER;
    this.maximumY = Number.MIN_SAFE_INTEGER;
    this.maximumZ = Number.MIN_SAFE_INTEGER;
  }
  calcBoundary(positions: Array<vec3>): void {
    if (positions.length > 0) {
      positions.forEach((position) => {
        this.minimumX = this.minimumX > position[0] ? position[0] : this.minimumX;
        this.minimumY = this.minimumY > position[1] ? position[1] : this.minimumY;
        this.minimumZ = this.minimumZ > position[2] ? position[2] : this.minimumZ;
        this.maximumX = this.maximumX < position[0] ? position[0] : this.maximumX;
        this.maximumY = this.maximumY < position[1] ? position[1] : this.maximumY;
        this.maximumZ = this.maximumZ < position[2] ? position[2] : this.maximumZ;
      });
      this.calcOrigin();
    } else {
      this.origin = vec3.fromValues(0, 0, 0);
      this.minimumX = 0;
      this.minimumY = 0;
      this.minimumZ = 0;
      this.maximumX = 0;
      this.maximumY = 0;
      this.maximumZ = 0;
    }
  }
  calcOrigin(): void {
    let offsetX = (this.maximumX - this.minimumX) / 2;
    let offsetY = (this.maximumY - this.minimumY) / 2;
    let offsetZ = (this.maximumZ - this.minimumZ) / 2;
    let originX = this.minimumX + offsetX;
    let originY = this.minimumY + offsetY;
    let originZ = this.minimumZ + offsetZ;
    this.origin = vec3.fromValues(originX, originY, originZ);
  }
  getBoundary() {
    return {
      'minimumX' : this.minimumX, 
      'maximumX' : this.maximumX,
      'minimumY' : this.minimumY, 
      'maximumY' : this.maximumY,
      'minimumZ' : this.minimumZ, 
      'maximumZ' : this.maximumZ,
    }
  }
}