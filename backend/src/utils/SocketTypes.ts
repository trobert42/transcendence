import { Socket } from 'socket.io';
import { Lobby } from '../game/lobby/lobby';
import { ServerEvents } from '../shared/server/ServerEvents';

export type ClientSocket = Socket & {
  data: {
    userId: number | null;
    userName: string | null; //change username with id or value never change
    playerId: number | null;
    lobby: Lobby | null;
  };

  emit: <T>(ev: ServerEvents, data: T) => boolean;
};
