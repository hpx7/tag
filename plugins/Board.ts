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
      style="position: relative; width: 500px; height: 500px;"
      @click="${(e: MouseEvent) =>
        this.client.updateTarget({ location: { x: e.offsetX, y: e.offsetY } }, (error) => {})}"
    >
      ${this.val.map((player) => this.renderPlayer(player))}
    </div>`;
  }

  renderPlayer(player: PlayerInfo) {
    return html`<div
      style=${styleMap({
        position: "absolute",
        left: player.location.x + "px",
        top: player.location.y + "px",
        color: player.name == this.state.chaser ? "red" : "white",
      })}
    >
      ${player.name}
    </div>`;
  }
}
