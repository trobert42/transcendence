import { User } from "@prisma/client";
import { Socket } from "socket.io";

export interface ChatSocket extends Socket {
  userId: number;
  userSelf: User;
  chatId: number | null;
}