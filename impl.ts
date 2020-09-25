import { Methods } from "./.rtag/methods";
import {
  ICreateGameRequest,
  IJoinGameRequest,
  IUpdateTargetRequest,
  PlayerData,
  PlayerName,
  PlayerState,
  Point,
} from "./.rtag/types";

interface InternalPlayerInfo {
  name: PlayerName;
  location: Point;
  target?: Point;
}

interface InternalState {
  players: InternalPlayerInfo[];
}

const SPEED = 100;

export class Impl implements Methods<InternalState> {
  createGame(userData: PlayerData, request: ICreateGameRequest): InternalState {
    return {
      players: [createPlayer(userData.playerName)],
    };
  }
  joinGame(state: InternalState, userData: PlayerData, request: IJoinGameRequest): string | void {
    state.players.push(createPlayer(userData.playerName));
  }
  updateTarget(state: InternalState, userData: PlayerData, request: IUpdateTargetRequest): string | void {
    const player = state.players.find((player) => player.name == userData.playerName)!;
    player.target = request.location;
  }
  onTick(state: InternalState): void {
    state.players.forEach((player) => {
      if (player.target != undefined) {
        const dx = player.target.x - player.location.x;
        const dy = player.target.y - player.location.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < SPEED) {
          player.location = player.target;
        } else {
          player.location.x += (dx / dist) * SPEED;
          player.location.y += (dy / dist) * SPEED;
        }
      }
    });
  }
  getUserState(state: InternalState, userData: PlayerData): PlayerState {
    const player = state.players.find((player) => player.name == userData.playerName)!;
    return {
      board: state.players.map(({ name, location }) => ({ name, location })),
      target: player.target,
    };
  }
}

function createPlayer(name: PlayerName) {
  return { name, location: { x: 0, y: 0 } };
}
