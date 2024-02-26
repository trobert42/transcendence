import { Socket } from "socket.io";

export interface GameState {
  roomId: string;
  ongoing: boolean;

  canvas: {
    width: number;
    height: number;
  };
  paddle: {
    speed: number;
    length: number;
    width: number;
  };
  player1: {
    x: number;
    y: number;
  };
  player2: {
    x: number;
    y: number;
  };
  ball: {
    x: number;
    y: number;
    dirx: number;
    diry: number;
    radius: number;
    speed: number;
  };
  stats: {
    player1_goals: number;
    player2_goals: number;
    winning_goals: number;
  };

  lobbyId: string;
  player1_id: number;
  player1_name: string;
  player2_id: number;
  player2_name: string;
  winner: number;
  looser: number;
  resultat: string;
  gameStarted: boolean;
  gameFinish: boolean;
  gameSuspended: boolean;
  scores: Record<Socket["id"], number>;
  save: number;
  round: number;
  lastWinner: number;
  launched: boolean;
}

export class GameRoom {
  player1_id: number;
  player2_id: number;

  state: GameState;
}

export const InitialGameState: GameState = {
  roomId: "",
  ongoing: false,

  canvas: {
    width: 1200,
    height: 800,
  },
  paddle: {
    speed: 10,
    length: 80,
    width: 10,
  },
  player1: {
    x: 0,
    y: 400,
  },
  player2: {
    x: 1200,
    y: 400,
  },
  ball: {
    x: 600,
    y: 400,
    dirx: 0,
    diry: 0,
    radius: 10,
    speed: 15,
  },
  stats: {
    player1_goals: 0,
    player2_goals: 0,
    winning_goals: 1,
  },

  lobbyId: "",
  player1_id: 0,
  player1_name: "",
  player2_id: 0,
  player2_name: "",
  winner: 0,
  looser: 0,
  resultat: "",
  gameStarted: false,
  gameFinish: false,
  gameSuspended: false,
  scores: {},
  save: 0,
  round: 0,
  lastWinner: 0,
  launched: false,
};
