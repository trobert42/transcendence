import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  User,
  Channel,
  AccessMode,
  Message,
  PrivateChat,
  ChatEntity,
} from "@prisma/client";
import { CreateChannelDTO, CreateMessageDTO } from "../../shared/chat/chat.dto";
import { ChatSocket } from "./chat.interfaces";
import { DatabaseError } from "./chat.errors";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(
    userId: number,
    content: string,
    chatEntityId: number,
  ): Promise<Message> {
    const newMessage = await this.prisma.message.create({
      data: {
        content: content,
        authorId: userId,
        chatPostedInId: chatEntityId,
      },
    });

    if (!newMessage)
      throw new DatabaseError('message creation failed');
    return newMessage;
  }

  async retrieveChatMessages(userId: number, chatId: number) {
    const blockedIds = await this.getUserBlockedIds(userId);
    const messages = await this.prisma.message.findMany({
      where: {
        chatPostedInId: chatId,
        authorId: {
          not: {
            in: blockedIds,
          }
        }
      },
    });
    if (!messages)
      throw new Error(`Error retrieving chat ${chatId} messages`);
    return messages;
  }

  async isBlocked(userId: number, targetId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { blockedBy: true },
    });
    if (!user) {
      throw new Error(`could not find user #${userId} in DB`);
    }

    console.log(`user #${user.id} is blocked by : ${user.blockedBy.map(u => u.id)}`);
    if (user.blockedBy.some(u => u.id === targetId))
      return true;
    console.log('not blocked !');
    return false;
  }

  async getUserBlockedIds(userId: number): Promise<number[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { blockedUsers: true },
    });
    if (!user) {
      throw new Error(`could not find user #${userId} in DB`);
    }

    return user.blockedUsers.map(user => user.id);
  }
}
