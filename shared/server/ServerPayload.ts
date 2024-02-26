import { ServerEvents } from "./ServerEvents";
import { Socket } from "socket.io";

export type ServerPayload = {
  [ServerEvents.LobbyState]: {
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
  };

  [ServerEvents.LobbyGameMessage]: {
    message: string;
    color?: "green" | "red" | "black" | "blue" | "yellow" | "purple" | "orange";
  };

  [ServerEvents.LobbyGameCountdown]: {
    count: number;
  }
  [ServerEvents.LobbyGameWinner] : {
    winner: string;
  }

};
