import { Board, Point } from "../.rtag/types";
import { RtagClient } from "../.rtag/client";

export default class CardsComponent extends HTMLElement {
  client: RtagClient | undefined;

  currPos: Point | undefined;
  targetPos: Point | undefined;
  lastUpdate: number | undefined;

  constructor() {
    super();

    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.display = "block";
    canvas.style.border = "1px solid white";
    canvas.onclick = (e: MouseEvent) => {
      this.client?.updateTarget({ location: { x: e.offsetX, y: e.offsetY } }, (error) => {});
    };
    this.attachShadow({ mode: "open" }).append(canvas);

    const ctx = canvas.getContext("2d")!;
    const draw = () => {
      requestAnimationFrame(draw);
      if (this.currPos && this.targetPos && this.lastUpdate) {
        const dx = this.targetPos.x - this.currPos.x;
        const dy = this.targetPos.y - this.currPos.y;

        const timeSinceLastUpdate = this.lastUpdate - Date.now();
        const timeUntilNextUpdate = timeSinceLastUpdate + 50;

        const numRendersRemaining = timeUntilNextUpdate / 16.667;
        if (numRendersRemaining < 1) {
          this.currPos = this.targetPos;
        } else {
          this.currPos.x += dx / numRendersRemaining;
          this.currPos.y += dy / numRendersRemaining;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.arc(this.currPos.x, this.currPos.y, 15, 0, 2 * Math.PI);
        ctx.stroke();
      }
    };
    draw();
  }

  set val(val: Board) {
    this.targetPos = val[0].location;
    this.lastUpdate = Date.now();
    if (this.currPos == undefined) {
      this.currPos = this.targetPos;
    }
  }
}
