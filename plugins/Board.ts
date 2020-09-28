import { Board, Point } from "../.rtag/types";
import { RtagClient } from "../.rtag/client";

interface ServerUpdate {
  update: Board;
  receivedAt: number;
}

const SERVER_TICKRATE = 50;
const CLIENT_TICKRATE = 16.67;
const BUFFER_SIZE = 3;

export default class CardsComponent extends HTMLElement {
  updateBuffer: ServerUpdate[];
  currPos: Point | undefined;
  nextUpdateTime: number | undefined;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.updateBuffer = [];
  }

  set val(val: Board) {
    this.updateBuffer.push({ update: val, receivedAt: Date.now() });
    if (this.nextUpdateTime == undefined) {
      this.nextUpdateTime = Date.now() + SERVER_TICKRATE;
    }
  }

  set client(client: RtagClient) {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.display = "block";
    canvas.style.border = "1px solid white";
    canvas.onclick = (e: MouseEvent) => {
      client.updateTarget({ location: { x: e.offsetX, y: e.offsetY } }, (error) => {});
    };

    this.shadowRoot!.append(canvas);

    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      requestAnimationFrame(draw);

      const currTime = Date.now();
      if (this.updateBuffer.length == 0) {
        return;
      }
      if (
        currTime - this.updateBuffer[0].receivedAt <= SERVER_TICKRATE * BUFFER_SIZE &&
        this.updateBuffer.length <= BUFFER_SIZE
      ) {
        return;
      }
      console.log(this.updateBuffer.length);
      while (this.updateBuffer.length > 4) {
        this.updateBuffer.shift();
      }

      const targetPos = this.updateBuffer[0].update[0].location;
      if (this.currPos == undefined) {
        this.currPos = targetPos;
      }
      if (this.nextUpdateTime == undefined) {
        this.nextUpdateTime = currTime + SERVER_TICKRATE;
      }

      const dx = targetPos.x - this.currPos.x;
      const dy = targetPos.y - this.currPos.y;
      const timeUntilNextUpdate = this.nextUpdateTime - currTime;
      const numRendersRemaining = timeUntilNextUpdate / CLIENT_TICKRATE;
      if (numRendersRemaining < 1) {
        this.currPos = targetPos;
        this.updateBuffer.shift();
        this.nextUpdateTime = undefined;
      } else {
        this.currPos.x += dx / numRendersRemaining;
        this.currPos.y += dy / numRendersRemaining;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.arc(this.currPos.x, this.currPos.y, 15, 0, 2 * Math.PI);
      ctx.stroke();
    };
    draw();
  }
}
