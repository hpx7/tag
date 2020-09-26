import { LitElement, css, html, property } from "lit-element";
import { styleMap } from "lit-html/directives/style-map";
import { Board, PlayerInfo, PlayerState } from "../.rtag/types";
import { RtagClient } from "../.rtag/client";

export default class CardsComponent extends LitElement {
  @property() val!: Board;
  @property() state!: PlayerState;
  @property() client!: RtagClient;

  render() {
    return html`<div
      style="position: relative; width: 500px; height: 500px; border: 1px solid white;"
      @click="${(e: MouseEvent) =>
        this.client.updateTarget({ location: { x: e.offsetX, y: e.offsetY } }, (error) => {})}"
    >
      ${this.val.map((player) => this.renderPlayer(player))}
    </div>`;
  }

  renderPlayer(player: PlayerInfo) {
    const color = player.name == this.state.chaser ? "red" : "white";
    return html`<div
      style=${styleMap({
        pointerEvents: "none",
        position: "absolute",
        left: player.location.x + "px",
        top: player.location.y + "px",
        border: "1px solid " + color,
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color,
      })}
    >
      ${player.name}
    </div>`;
  }
}
