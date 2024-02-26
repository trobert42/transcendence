import { Body, Controller, Get, Inject, NotFoundException, Param, ParseIntPipe, Post, Req } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { PrivateChatDTO } from "../../shared/chat/chat.dto";
import { PrivateChat } from "./chat.types";
import { Request } from "express";
import { PrivateChatService } from "./privatechat.service";
import { formatPrivateChatToDTO } from "./chat.dto";
import { ChatGateway } from "./chat.gateway";

@Controller("api/private-chats")
export class PrivateChatController {
  constructor(
    private readonly privateChatService: PrivateChatService,
    private readonly chatService: ChatService,
    @Inject(ChatGateway) private readonly chatGateway: ChatGateway,
  ) {}

  @Get()
  async getPrivateChats(@Req() req): Promise<PrivateChatDTO[]> {
    const pvChats = await this.privateChatService.getUserPrivateChats(
      req.user.id,
    );
    const pvChatsDTO = pvChats.map((chat) =>
      formatPrivateChatToDTO(req.user.id, chat)
    );
    return pvChatsDTO;
  }

  @Get(":targetId")
  async getPrivateChat(
    @Req() req,
    @Param("targetId", ParseIntPipe) targetId: number,
  ): Promise<PrivateChatDTO | null> {
    const pvChat = await this.privateChatService.getPrivateChatWithUser(
      req.user.id,
      targetId,
    );
    return formatPrivateChatToDTO(req.user.id, pvChat);
  }

  @Post()
  async createPrivateChat(
    @Req() req,
    @Body("targetId") targetId: number,
  ): Promise<PrivateChatDTO | null> {
	  if (!targetId)
      throw new NotFoundException('cant find chat with provided id');
    const alreadyCreated = await this.privateChatService.getPrivateChatFromUsers(
      req.user.id,
      targetId,
    );
    if (alreadyCreated)
      return formatPrivateChatToDTO(req.user.id, alreadyCreated);
    const pvChat = await this.privateChatService.createPrivateChat(
      req.user.id,
      targetId,
    );
    if (!pvChat)
      return formatPrivateChatToDTO(req.user.id, pvChat);

    this.chatGateway.emitToChatClients(pvChat.chatId, 'newPrivateChat',
      formatPrivateChatToDTO(req.user.id, pvChat),
    );
    pvChat.users.forEach(user => this.chatGateway.emitToUserClients(
      user.id, 'newPrivateChat',
      formatPrivateChatToDTO(user.id, pvChat),
    ));
    return formatPrivateChatToDTO(req.user.id, pvChat);
  }
}
