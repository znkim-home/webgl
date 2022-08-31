import {cameraPosition, cameraAngle} from './EzData.js';

export class EzKey {
  constructor(ezWebGL) {
    this.ezWebGL = ezWebGL;
    this.initHandler();
    this.isPressd = false;
  }

  initHandler() {
    window.onmousewheel = (e) => {
      this.moveMouseWheel(e);
    }

    window.onkeydown = (e) => {
      this.isPressd = true;
      //console.log(cameraPosition);

      const factor = 0.5;
      const angleFactor = 0.05;
      if (e.key == "w") {
        cameraPosition[1] -= factor;
      } else if (e.key == "s") {
        cameraPosition[1] += factor;
      } else if (e.key == "a") {
        cameraPosition[0] += factor;
      } else if (e.key == "d") {
        cameraPosition[0] -= factor;
      } /*else if (e.key == "q") {
        cameraPosition[1] -= factor;
      } else if (e.key == "e") {
        cameraPosition[1] += factor;
      }*/ else if (e.key == "ArrowUp") {
        cameraAngle.toggle[0] = 1;
        cameraAngle.angle[0] -= angleFactor;
      } else if (e.key == "ArrowDown") {
        cameraAngle.toggle[0] = 1;
        cameraAngle.angle[0] += angleFactor;
      } else if (e.key == "ArrowLeft") {
        cameraAngle.toggle[2] = 1;
        cameraAngle.angle[2] -= angleFactor;
      } else if (e.key == "ArrowRight") {
        cameraAngle.toggle[2] = 1;
        cameraAngle.angle[2] += angleFactor;
      }
    };

    window.addEventListener("keydown", () => {
      //let test = e;
      
      this.isPressd = false;
    });
  }

  moveMouseWheel(e) {
    const factor = 0.75;
    if (e.wheelDelta > 0) {
      cameraPosition[2] += factor;
    } else if (e.wheelDelta < 0) {
      cameraPosition[2] -= factor;
    }
  }
}