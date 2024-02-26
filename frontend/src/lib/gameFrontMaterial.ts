import { Socket } from "socket.io";

export interface CanvasParams {
  width: number;
  height: number;
}

export interface gameCountDown {
  count: number,
}

export interface gameWinner {
  winner: string,
}

export type GameParams = {
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
  player1_name: string;
  player2_name: string;
  gameStarted: boolean;
  gameFinish: boolean;
  gameSuspended: boolean;
  scores: Record<Socket["id"], number>;
};