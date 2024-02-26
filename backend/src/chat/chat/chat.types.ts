import { PrivateChat as PrismaPrivateChat, User } from "@prisma/client";
import { Socket } from "socket.io";

export const CHATERROR = 'CHAT ERROR :';

export type PrivateChat = PrismaPrivateChat & {
  users: User[];
};

export enum AccessValidation {
  OK,
  FAIL,
  STANDBY,
}