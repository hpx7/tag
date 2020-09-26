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
  chaser: PlayerName;
  taggedAt: number;
}

const SPEED = 10;
const TAG_RADIUS = 10;

export class Impl implements Methods<InternalState> {
  createGame(userData: PlayerData, request: ICreateGameRequest): InternalState {
    return {
      players: [createPlayer(userData.playerName)],
      chaser: userData.playerName,
      taggedAt: 0,
    };
  }
  joinGame(state: InternalState, userData: PlayerData, request: IJoinGameRequest): string | void {
    state.players.push(createPlayer(userData.playerName));
  }
  updateTarget(state: InternalState, userData: PlayerData, request: IUpdateTargetRequest): string | void {
    const player = state.players.find((player) => player.name == userData.playerName);
    if (player == undefined) {
      return "Game not joined";
    }
    player.target = request.location;
  }
  onTick(state: InternalState): void {
    const tagCooldownOver = Date.now() - state.taggedAt >= 3000;

    state.players.forEach((player) => {
      if (player.target != undefined && (player.name != state.chaser || tagCooldownOver)) {
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

    if (tagCooldownOver) {
      const chaser = state.players.find((player) => player.name == state.chaser)!;
      for (const player of state.players) {
        if (player.name != state.chaser) {
          if (getDistance(chaser.location, player.location) <= TAG_RADIUS) {
            state.chaser = player.name;
            state.taggedAt = Date.now();
            break;
          }
        }
      }
    }
  }
  getUserState(state: InternalState, userData: PlayerData): PlayerState {
    const player = state.players.find((player) => player.name == userData.playerName);
    return {
      board: state.players.map(({ name, location }) => ({ name, location })),
      target: player?.target,
      chaser: state.chaser,
    };
  }
}

function createPlayer(name: PlayerName) {
  return { name, location: { x: 0, y: 0 } };
}

function getDistance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
