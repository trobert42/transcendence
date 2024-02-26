import { atom } from 'recoil';
import { Socket } from 'socket.io-client';
import { ServerEvents } from '../shared/server/ServerEvents';
import { ClientEvents } from '../shared/client/ClientEvents';
import { SetterOrUpdater } from 'recoil';
import React from 'react';

export type Listener<T> = (data: T) => void;

export type SocketState = {
  connected: boolean;
};

const state = atom<SocketState>({
  key: 'SocketState',
  default: {
    connected: false,
  },
});

export default state;

export type ClientSocket = Socket & {
  data: {
    playerId: number | null;
  };
};

export type EmitOptions<T> = {
  event: ClientEvents;
  data?: T;
};

export interface SocketFunctions {
  getSocketId: () => string | null;
  connect: () => void;
  disconnect: () => void;
  emit: <T>(options: EmitOptions<T>) => void;
  addToListen: <T>(event: ServerEvents, listener: Listener<T>) => void;
  removeToListen: <T>(event: ServerEvents, listener: Listener<T>) => void;
  onDisconnect: () => void;
  socket: ClientSocket | null;
  setSocketState: SetterOrUpdater<SocketState>;
  connectionLost: boolean;
}

export interface SocketProviderProps {
  children: React.ReactNode;
  endpointUrl: string;
}
