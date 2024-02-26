import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { User } from "@prisma/client";
import { CHATERROR, PrivateChat } from "./chat.types";
import { PrivateChatDTO } from "../../shared/chat/chat.dto";

@Injectable()
export class PrivateChatService {
  constructor(private prisma: PrismaService) {}

  async createPrivateChat(
    userId: number,
    targetId: number,
  ): Promise<PrivateChat | null> {
    const test = await this.prisma.privateChat.findFirst({
      where: {
        AND: [
          {
            users: { some: { id: userId } },
          },
          {
            users: { some: { id: targetId } },
          },
        ],
      },
      include: { users: true }
    });
    if (test) {
      console.log(`PrivateChat #${test.id} already exists. Creation canceled`);
      return null;
    }

    const users = { connect: [{ id: userId }, { id: targetId }] };
    const chat = await this.prisma.chatEntity.create({});
    if (!chat) throw new Error("chat creation in DB for PrivateChat failed");

    const pvChat = await this.prisma.privateChat.create({
      data: {
        users,
        chat: {
          connect: { id: chat.id },
        },
      },
      include: { users: true },
    });
    if (!pvChat)
      throw new Error("privateChat creation in DB failed");

    console.log(`created new PrivateChat with id ${pvChat.id}`);
    return pvChat;
  }

  async getPrivateChatById(privateChatId: number): Promise<PrivateChat | null> {
    const privateChat = await this.prisma.privateChat.findUnique({
      where: { id: privateChatId },
      include: { users: true },
    });

    if (!privateChat)
      throw new Error(`can't fetch privateChat with id ${privateChatId} in DB`);
    return privateChat;
  }

  async getUserPrivateChats(userId: number): Promise<PrivateChat[]> {
    try {
      const pvChats = await this.prisma.privateChat.findMany({
        where: {
          users: {
            some: { id: userId },
          },
        },
        include: { users: true },
      });
      if (!pvChats)
        return [];
      return pvChats;
    } catch(error) {
      console.error(CHATERROR, 'error retrieving privateChats: ', error);
      throw new NotFoundException(error);
    }
  }

  async getPrivateChatWithUser(
    userId: number,
    targetId: number,
  ): Promise<PrivateChat> {
    try {
      const pvChat = await this.prisma.privateChat.findFirst({
        where: {
          AND: [
            {
              users: { some: { id: userId } },
            },
            {
              users: { some: { id: targetId } },
            },
          ],
        },
        include: { users: true },
      });
      return pvChat;
    } catch(error) {
      console.error(CHATERROR, 'error retrieving user privateChats ', error);
      throw new NotFoundException(error);
    }
  }

  async getPrivateChatFromUsers(userId: number, targetId: number): Promise<PrivateChat | null> {
    const pvChat = await this.prisma.privateChat.findFirst({
      where: {
        AND: [
          {
            users: { some: { id: userId } },
          },
          {
            users: { some: { id: targetId } },
          },
        ],
      },
      include: { users: true }
    });
    return pvChat;
  }

  async canUserAccessPrivateChat(
    userId: number,
    pvChatId: number,
  ): Promise<boolean> {
    const pvChat = await this.getPrivateChatById(pvChatId);
    if (!pvChat) return false;
    if (pvChat.users.some((user) => user.id === userId)) return true;
    return false;
  }
}
