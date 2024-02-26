import { Socket } from "socket.io-client";
export interface User {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  avatarLink: string;
  isLogged: boolean;
  isDoneRegister: boolean;
}

export interface UserWithBlockStatus {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  avatarLink: string;
  isLogged: boolean;
  isDoneRegister: boolean;
  isBlock: boolean;
}

export interface Friend {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  isLogged: boolean;
  avatarLink: string;
  isReceiver?: boolean;
}

export interface IMessage {
  id: number;
  content: string;
  authorId: number;
  chatId: number;
  createdAt: Date;
}

export enum ChatType {
  PRIVATECHAT,
  CHANNEL,
}

export interface Chat {
  id: number;
  name: string;
  type: ChatType;

  postMessage: (socket: Socket | null, msgContent: string) => void;
  postInvit: (socket: Socket | null, msgContent: string) => void;
  join: (socket: Socket | null) => void;
}
