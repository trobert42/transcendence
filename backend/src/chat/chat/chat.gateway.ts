import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  WebSocketServer,
} from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { AuthService } from "src/auth/auth.service";
import { Headers } from "@nestjs/common";
import { AccessMode, Channel, Message, User } from "@prisma/client";
import {
  ChannelJoinedDTO,
  MessageDTO,
  UserDTO,
  ChannelDTO,
  PrivateChatJoinDTO,
  ChannelUserActionDTO,
  newChannelMemberDTO,
} from "../../shared/chat/chat.dto";
import { ChannelService } from "./channel.service";
import { PrivateChatService } from "./privatechat.service";
import {
  ChannelJoinValidationDTO,
  ChannelUserActionValidationDTO,
  CreateChannelValidationDTO,
  CreateMessageValidationDTO,
  UpdateChannelValidationDTO,
  formatChannelToDTO,
  formatMessageToDTO,
  formatUserToDTO,
} from "./chat.dto";
import { ServerEvents } from "../../shared/server/ServerEvents";
import { ChatSocket } from "./chat.interfaces";
import { AccessValidation, CHATERROR } from "./chat.types";
import { interval, Subscription } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { SyncDelay } from "src/utils/helpers";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { UserService } from "src/user/user.service";

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private connectedClients: ChatSocket[] = [];
  private readonly expirationCheckInterval = 10000;
  private readonly expirationCheckSubscription: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
    private readonly channelService: ChannelService,
    private readonly privateChatService: PrivateChatService,
    private readonly userService: UserService,
  ) {
    this.expirationCheckSubscription = this.setupExpirationChecks();
  }

  async handleConnection(
    @ConnectedSocket() client: ChatSocket,
    @Headers("Authorization") authHeader: string,
  ) {
    const accessToken = client.handshake.auth.token;
    const user = await this.authService.identifyClient(accessToken);
    if (!user) {
      console.error(
        `client ${client.id} does not have valid token to access chat.`,
      );
      client.disconnect();
      return;
    }
    client.userId = user.id;
    client.userSelf = user;
    client.chatId = null;
    this.connectedClients.push(client);
    console.log(`user ${user.id} connected to websocket.`);
  }

  handleDisconnect(@ConnectedSocket() client: ChatSocket) {
    this.channelService.unbindClientToChannel(client.id);
    const clientIndex = this.connectedClients.findIndex(
      (clt) => clt.id === client.id,
    );
    if (clientIndex >= 0) this.connectedClients.splice(clientIndex, 1);
    console.log("client disconnected from ChatSocket.");
  }

  @SubscribeMessage("createChannel")
  async handleCreateChannel(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() channelData: CreateChannelValidationDTO,
  ) {
    console.log("creating channel...");
    try {
      const validationObj = plainToClass(CreateChannelValidationDTO, channelData);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      const newChannel = await this.channelService.createChannel(
        client.userId,
        channelData,
      );
      this.connectedClients.forEach((cl) =>
        cl.emit(ServerEvents.newChannel, formatChannelToDTO(newChannel)),
      );
      console.log(`channel (#${newChannel.id}) created.`);
    } catch (error) {
      console.error(CHATERROR, "channel creation failed: ", error);
    }
  }

  @SubscribeMessage("updateChannel")
  async handleUpdateChannel(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() updateData: UpdateChannelValidationDTO,
  ) {
    try {
      console.log("channel update requested");
      const validationObj = plainToClass(UpdateChannelValidationDTO, updateData);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      if (
        !(await this.channelService.isOwner(
          client.userId,
          updateData.channelId,
        ))
      ) {
        console.log(
          `channel update failed. User #${client.userId} is not the owner`,
        );
        return;
      }
      const updatedChannel = await this.channelService.updateChannel(
        updateData.channelId,
        updateData.chanInfos,
      );
      if (updatedChannel) {
        console.log("channel update success");
        this.connectedClients.forEach((cl) =>
          cl.emit(
            ServerEvents.channelUpdated,
            formatChannelToDTO(updatedChannel),
          ),
        );
      }
    } catch (error) {
      console.error(CHATERROR, "channel update failed: ", error);
    }
  }

  @SubscribeMessage("deleteChannel")
  async handleDeleteChannel(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() channelId: number,
  ) {
    try {
      if (!(await this.channelService.isOwner(client.userId, channelId))) {
        console.log(
          `channel delete failed. User #${client.userId} is not the owner`,
        );
      }
      if (!(await this.channelService.isOwner(client.userId, channelId))) {
        console.log(
          `channel delete failed. User #${client.userId} is not the owner`,
        );
        return;
      }
      if (await this.channelService.deleteChannel(channelId)) {
        this.connectedClients.forEach((cl) =>
          cl.emit(ServerEvents.channelDeleted, channelId),
        );
      }
    } catch (error) {
      console.error(`deletion of channel ${channelId} failed.`, error);
    }
  }

  @SubscribeMessage("channelMessage")
  @SubscribeMessage("channelMessage")
  async handleChannelMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() msg: CreateMessageValidationDTO,
  ) {
    try {
      console.log(`Received a channel message from user ${client.userId}.`);
      const validationObj = plainToClass(CreateMessageValidationDTO, msg);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      if (
        !(await this.channelService.canUserAccessChannel(
          client.userId,
          msg.chatId,
        ))
      ) {
        client.emit("channelAccessDenied", msg.chatId);
        return;
      }
      if (await this.channelService.isUserMuted(client.userId, msg.chatId)) {
        return;
      }
      const channel = await this.channelService.getById(msg.chatId);
      const newMsg = await this.chatService.createMessage(
        client.userId,
        msg.content,
        channel.chatId,
      );
      const chatActiveClients = this.getChatConnectedClients(channel.chatId);
      chatActiveClients.forEach(async (chatClient) => {
        if (
          !(await this.chatService.isBlocked(client.userId, chatClient.userId))
        ) {
          chatClient.emit(
            ServerEvents.newMessageInChat,
            formatMessageToDTO(newMsg),
          );
        }
      });
    } catch (error) {
      console.error(CHATERROR, "posting message to channel failed: ", error);
    }
  }

  @SubscribeMessage("privateMessage")
  async handlePrivateMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() msg: CreateMessageValidationDTO,
  ) {
    try {
      console.log(
        `Received a private channel message from user ${client.userId}.`,
      );
      const validationObj = plainToClass(CreateMessageValidationDTO, msg);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      const privateChat = await this.privateChatService.getPrivateChatById(
        msg.chatId,
      );
      const newMsg = await this.chatService.createMessage(
        client.userId,
        msg.content,
        privateChat.chatId,
      );
      const chatActiveClients = this.getChatConnectedClients(
        privateChat.chatId,
      );
      chatActiveClients.forEach(async (chatClient) => {
        if (
          !(await this.chatService.isBlocked(client.userId, chatClient.userId))
        ) {
          chatClient.emit(
            ServerEvents.newMessageInChat,
            formatMessageToDTO(newMsg),
          );
        }
      });
    } catch (error) {
      console.error(
        CHATERROR,
        "posting message to private chat failed: ",
        error,
      );
    }
  }

  @SubscribeMessage("InvitPlayerToPlay")
  async handleInvitPlayerToPlay(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() msg: CreateMessageValidationDTO,
  ) {
    try {
      console.log(
        `Received a private ch annel message from user ${client.userId}.`,
      );
      const validationObj = plainToClass(CreateMessageValidationDTO, msg);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      const user: User | null = client["user"];
      const privateChat = await this.privateChatService.getPrivateChatById(
        msg.chatId,
      );
      const newMsgContent = `Let's play my friend: ` +process.env.REACT_APP_SITE_URL  +`:3000/game/lobby/${msg.content}`;
      const newMsg = await this.chatService.createMessage(
        client.userId,
        newMsgContent,
        privateChat.chatId,
      );
      const chatActiveClients = this.getChatConnectedClients(privateChat.chatId);
      chatActiveClients.forEach(async (chatClient) => {
        if (
          !(await this.chatService.isBlocked(client.userId, chatClient.userId))
        ) {
          chatClient.emit("newMessage", formatMessageToDTO(newMsg));
        }
      });
    } catch(error) {
      console.error(CHATERROR, 'Inviting player to play failded :', error);
    }
  }

  @SubscribeMessage("joinChannel")
  async handleJoinChannel(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelJoinValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelJoinValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      const joinStatus = await this.channelService.checkAccessConditions(
        client.userId,
        dto,
      );
      if (joinStatus === AccessValidation.FAIL) {
        console.log(
          `access to channel #${dto.channelId} denied for user #${client.userId}`,
        );
        client.emit(ServerEvents.channelJoinDeclined, dto.channelId);
      } else if (joinStatus === AccessValidation.STANDBY) {
        console.log(
          `access to channel #${dto.channelId} waiting for validation for user #${client.userId}`,
        );
        client.emit(ServerEvents.channelJoinStandby, dto.channelId);
      } else {
        const isNewMember = await this.channelService.newChannelMember(
          client.userId,
          dto.channelId,
        );
        const channel = await this.channelService.getByIdAllFields(
          dto.channelId,
        );
        const membersDTO: UserDTO[] = channel.members.map((mem) =>
          formatUserToDTO(mem),
        );
        const adminsDTO: number[] = channel.admins.map((admin) => admin.id);
        const bannedDTO: number[] = channel.banned.map((banned) => banned.id);
        const mutedDTO: number[] = channel.muted.map((muted) => muted.id);
        const messages = await this.chatService.retrieveChatMessages(
          client.userId,
          channel.chatId,
        );
        const messagesDTO: MessageDTO[] = messages.map((msg) =>
          formatMessageToDTO(msg),
        );

        const acceptDTO = new ChannelJoinedDTO(
          dto.channelId,
          messagesDTO,
          membersDTO,
          channel.ownerId,
          adminsDTO,
          bannedDTO,
          mutedDTO,
          channel.chatId,
        );
        client.emit(ServerEvents.channelJoinAccepted, acceptDTO);
        if (isNewMember) {
          const chatClients = this.getChatConnectedClients(channel.chatId);
          chatClients.forEach((cl) => {
            if (cl.userId !== client.userId) {
              cl.emit(
                ServerEvents.newChannelMember,
                new newChannelMemberDTO(
                  formatUserToDTO(client.userSelf),
                  channel.id,
                ),
              );
            }
          });
        }

        client.chatId = channel.chatId;
        this.channelService.bindClientToChannel(client.id, channel.id);
      }
    } catch (error) {
      console.error(CHATERROR, "error during channel join: ", error);
    }
  }

  @SubscribeMessage("joinPrivateChat")
  async handleJoinPrivateChat(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() pvChatId: number,
  ) {
    try {
      console.log(
        `user ${client.userId} wants to join privateChat ${pvChatId}`,
      );
      if (
        await this.privateChatService.canUserAccessPrivateChat(
          client.userId,
          pvChatId,
        )
      ) {
        const pvChat =
          await this.privateChatService.getPrivateChatById(pvChatId);

        const usersDTO: UserDTO[] = pvChat.users.map((user) =>
          formatUserToDTO(user),
        );
        const messages = await this.chatService.retrieveChatMessages(
          client.userId,
          pvChat.chatId,
        );
        const messagesDTO = messages.map((msg) => formatMessageToDTO(msg));

        const acceptDTO = new PrivateChatJoinDTO(
          pvChat.id,
          messagesDTO,
          usersDTO,
          pvChat.chatId,
        );
        client.emit(ServerEvents.privateChatJoinAccepted, acceptDTO);
        console.log('in joinPrivateChat, pvChatId = ', pvChat.chatId);
        client.chatId = pvChat.chatId;
      } else {
        client.emit(ServerEvents.privateChatJoinDeclined);
      }
    } catch (error) {
      console.error(CHATERROR, "private chat join failed: ", error);
    }
  }

  @SubscribeMessage("approveJoin")
  async handleJoinApproval(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelUserActionValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelUserActionValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      if (!await this.channelService.isOwner(client.userId, dto.channelId)) {
        console.log(
          `join approval failed. User need to be owner of the channel`,
        );
        return;
      }
      await this.channelService.approveUserJoin(dto.userId, dto.channelId);
      console.log(
        `join request approved. User #${dto.userId} added to channel #${dto.channelId} members`,
      );
      const channel = await this.channelService.getById(dto.channelId);
      const chatClients = this.getChatConnectedClients(channel.chatId);
      chatClients.forEach(async (cl) => {
        cl.emit(
          ServerEvents.newChannelMember,
          new newChannelMemberDTO(
            formatUserToDTO(await this.userService.getUserById(dto.userId)),
            channel.id,
          ),
        );
      });
    } catch (error) {
      console.error(CHATERROR, "join request approval failed :", error);
    }
  }

  @SubscribeMessage("addChannelMember")
  async handleNewMember(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelUserActionValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelUserActionValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      if (!await this.channelService.isOwner(client.userId, dto.channelId)) {
        console.log(`add member failed. User need to be owner of the channel`);
        return;
      }
      await this.channelService.newChannelMember(dto.userId, dto.channelId);
      this.emitToChatClients(
        await this.channelService.getChannelChatId(dto.channelId),
        ServerEvents.newChannelMember,
        new ChannelUserActionDTO(dto.userId, dto.channelId),
      );
      console.log(`user ${dto.userId} added to members of channel ${dto.channelId}`);
    } catch (error) {
      console.error(CHATERROR, "adding new member to channel failed: ", error);
    }
  }

  @SubscribeMessage("ban")
  async handleBan(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelUserActionValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelUserActionValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      if (!(await this.channelService.isAdmin(client.userId, dto.channelId))) {
        console.log(`ban failed: user ${client.userId} needs admin privilege`);
        client.emit("needAdminPrivilege");
        return;
      }

      if (await this.channelService.banUser(dto.userId, dto.channelId)) {
        console.log(
          `user #${dto.userId} has been banned from channel #${dto.channelId} by user #${client.userId}`,
        );
        this.emitToChatClients(
          await this.channelService.getChannelChatId(dto.channelId),
          ServerEvents.banned,
          new ChannelUserActionDTO(dto.userId, dto.channelId),
        );
      }
    } catch (error) {
      console.error(CHATERROR, "ban user failed: ", error);
    }
  }

  @SubscribeMessage("unban")
  async handleUnban(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelUserActionValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelUserActionValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      if (!(await this.channelService.isAdmin(client.userId, dto.channelId))) {
        console.log(
          `unban failed: user ${client.userId} needs admin privilege`,
        );
        client.emit("needAdminPrivilege");
        return;
      }

      await this.channelService.unbanUser(dto.userId, dto.channelId);
      console.log(
        `user #${dto.userId} has been unbanned from channel #${dto.channelId} by user #${client.userId}`,
      );
      this.emitToChatClients(
        await this.channelService.getChannelChatId(dto.channelId),
        ServerEvents.unbanned,
        new ChannelUserActionDTO(dto.userId, dto.channelId),
      );
    } catch (error) {
      console.error(CHATERROR, "unban user failed: ", error);
    }
  }

  @SubscribeMessage("mute")
  async handleMute(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelUserActionValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelUserActionValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      if (!(await this.channelService.isAdmin(client.userId, dto.channelId))) {
        console.log(`mute failed: user ${client.userId} needs admin privilege`);
        client.emit("needAdminPrivilege");
        return;
      }

      if (await this.channelService.muteUser(dto.userId, dto.channelId)) {
        console.log(
          `user #${dto.userId} has been muted from channel #${dto.channelId} by user #${client.userId}`,
        );
        this.emitToChatClients(
          await this.channelService.getChannelChatId(dto.channelId),
          ServerEvents.muted,
          new ChannelUserActionDTO(dto.userId, dto.channelId),
        );
      }
    } catch (error) {
      console.error(CHATERROR, "mute user failed: ", error);
    }
  }

  @SubscribeMessage("unmute")
  async handleUnmute(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelUserActionValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelUserActionValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      if (!(await this.channelService.isAdmin(client.userId, dto.channelId))) {
        console.log(
          `unmute failed: user ${client.userId} needs admin privilege`,
        );
        client.emit("needAdminPrivilege");
        return;
      }

      await this.channelService.unmuteUser(dto.userId, dto.channelId);
      console.log(
        `user #${dto.userId} has been unmuted from channel #${dto.channelId} by user #${client.userId}`,
      );
      this.emitToChatClients(
        await this.channelService.getChannelChatId(dto.channelId),
        ServerEvents.unmuted,
        new ChannelUserActionDTO(dto.userId, dto.channelId),
      );
    } catch (error) {
      console.error(CHATERROR, "unmute user failed: ", error);
    }
  }

  @SubscribeMessage("kick")
  async handleKick(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelUserActionValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelUserActionValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      if (!(await this.channelService.isAdmin(client.userId, dto.channelId))) {
        console.log(`kick failed: user ${client.userId} needs admin privilege`);
        client.emit("needAdminPrivilege");
        return;
      }

      if (await this.channelService.kickUser(dto.userId, dto.channelId)) {
        console.log(
          `user #${dto.userId} has been kicked from channel #${dto.channelId} by user #${client.userId}`,
        );
        console.log(
          `user #${dto.userId} has been kicked from channel #${dto.channelId} by user #${client.userId}`,
        );
        this.emitToChatClients(
          await this.channelService.getChannelChatId(dto.channelId),
          ServerEvents.kicked,
          new ChannelUserActionDTO(dto.userId, dto.channelId),
        );
        await this.ejectUser(dto.userId, dto.channelId);
      }
    } catch (error) {
      console.error(CHATERROR, "kick user failed: ", error);
    }
  }

  @SubscribeMessage("promote")
  async handlePromote(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelUserActionValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelUserActionValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      if (!(await this.channelService.isOwner(client.userId, dto.channelId))) {
        console.log(
          `promote failed: user ${client.userId} needs owner privilege`,
        );
        client.emit("needOwnerPrivilege");
        return;
      }
      if (await this.channelService.promoteUser(dto.userId, dto.channelId)) {
        console.log(
          `user #${dto.userId} has been promoted from channel #${dto.channelId} by user #${client.userId}`,
        );
        this.emitToChatClients(
          await this.channelService.getChannelChatId(dto.channelId),
          ServerEvents.promoted,
          new ChannelUserActionDTO(dto.userId, dto.channelId),
        );
      }
    } catch (error) {
      console.error(CHATERROR, "promote user failed: ", error);
    }
  }

  @SubscribeMessage("demote")
  async handleDemote(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: ChannelUserActionValidationDTO,
  ) {
    try {
      const validationObj = plainToClass(ChannelUserActionValidationDTO, dto);
      const errors = await validate(validationObj);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints)).flat();
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      if (!(await this.channelService.isOwner(client.userId, dto.channelId))) {
        console.log(
          `demote failed: user ${client.userId} needs owner privilege`,
        );
        client.emit("needAdminPrivilege");
        return;
      }

      if (await this.channelService.demoteUser(dto.userId, dto.channelId)) {
        console.log(
          `user #${dto.userId} has been demoted from channel #${dto.channelId} by user #${client.userId}`,
        );
        this.emitToUserClients(dto.userId, "demoted", dto.channelId);
        this.emitToChatClients(
          await this.channelService.getChannelChatId(dto.channelId),
          ServerEvents.demoted,
          new ChannelUserActionDTO(dto.userId, dto.channelId),
        );
      }
    } catch (error) {
      console.error(CHATERROR, "demote user failed: ", error);
    }
  }

  @SubscribeMessage("leaveChannel")
  async handleLeaveChannel(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() channelId: number,
  ) {
    try {
      console.log(`client #${client.userId} left channel #${channelId}`);
      if (await this.channelService.isOwner(client.userId, channelId)) {
        console.log("IN LEFT CLIENT IS OWNER");
        const ownerId = await this.channelService.changeOwner(
          client.userId,
          channelId,
        );
        this.emitToChatClients(
          await this.channelService.getChannelChatId(channelId),
          ServerEvents.channelOwnerChanged,
          new ChannelUserActionDTO(ownerId, channelId),
        );
      }
      await this.leaveChannel(client, channelId);
    } catch (error) {
      console.error(CHATERROR, "leave channel failed: ", error);
    }
  }

  async leaveChannel(client: ChatSocket, channelId: number) {
    SyncDelay(2000);
    if (!this.channelService.deleteMember(client.userId, channelId))
      return;
    client.chatId = null;
    this.channelService.unbindClientToChannel(client.id);
    const channel = await this.channelService.getById(channelId);
    const chatClients = this.getChatConnectedClients(channel.chatId);
    chatClients.forEach(async (cl) => {
      cl.emit(
        ServerEvents.deletedChannelMember,
        new newChannelMemberDTO(
          formatUserToDTO(await this.userService.getUserById(client.userId)),
          channel.id,
        ),
      );
    });
  }

  async ejectUser(userId: number, channelId: number) {
    SyncDelay(2000);
    if (!this.channelService.deleteMember(userId, channelId))
      return;
    const userClients = this.getUserConnectedClients(userId);
    userClients.forEach((client) => {
      client.chatId = null;
      this.channelService.unbindClientToChannel(client.id);
    });
    const channel = await this.channelService.getById(channelId);
    const chatClients = this.getChatConnectedClients(channel.chatId);
    chatClients.forEach(async (cl) => {
      cl.emit(
        ServerEvents.deletedChannelMember,
        new newChannelMemberDTO(
          formatUserToDTO(await this.userService.getUserById(userId)),
          channel.id,
        ),
      );
    });
  }

  getChatConnectedClients(chatId: number): ChatSocket[] {
    return this.connectedClients.filter((client) => client.chatId === chatId);
  }

  getUserConnectedClients(userId: number): ChatSocket[] {
    return this.connectedClients.filter((client) => client.userId === userId);
  }

  emitToUserClients(userId: number, eventName: string, data?: any) {
    const userClients = this.getUserConnectedClients(userId);
    if (data) userClients.forEach((client) => client.emit(eventName, data));
    else userClients.forEach((client) => client.emit(eventName));
  }

  emitToChatClients(chatId: number, eventName: string, data?: any) {
    const chatClients = this.getChatConnectedClients(chatId);
    if (data) {
      chatClients.forEach((client) => client.emit(eventName, data));
    }
    else chatClients.forEach((client) => client.emit(eventName));
  }

  setupExpirationChecks() {
    return interval(this.expirationCheckInterval)
      .pipe(mergeMap(() => this.checkExpirations()))
      .subscribe();
  }

  async checkExpirations() {
    await this.checkMuteExpirations();
    await this.checkBanExpirations();
  }

  async checkMuteExpirations() {
    const expirations = await this.channelService.getExpiredMuteDurations();
    for (const exp of expirations) {
      try {
        await this.channelService.unmuteUser(exp.userId, exp.channelId);
        console.log(
          `user #${exp.userId} has been unmuted from channel #${exp.channelId} by Expiration check`,
        );
        this.emitToChatClients(
          await this.channelService.getChannelChatId(exp.channelId),
          ServerEvents.unmuted,
          new ChannelUserActionDTO(exp.userId, exp.channelId),
        );
      } catch (error) {
        console.error(
          `error processing mute expiration for user #${exp.userId} in channel #${exp.channelId}: `,
          error,
        );
      }
    }
  }

  async checkBanExpirations() {
    const expirations = await this.channelService.getExpiredBanDurations();
    for (const exp of expirations) {
      try {
        await this.channelService.unbanUser(exp.userId, exp.channelId);
        console.log(
          `user #${exp.userId} has been unbanned from channel #${exp.channelId} by Expiration check`,
        );
        this.emitToChatClients(
          await this.channelService.getChannelChatId(exp.channelId),
          ServerEvents.unbanned,
          new ChannelUserActionDTO(exp.userId, exp.channelId),
        );
      } catch (error) {
        console.error(
          `error processing ban expiration for user #${exp.userId} in channel #${exp.channelId}: `,
          error,
        );
      }
    }
  }
}
