import { Socket } from "socket.io-client";
import { Chat, ChatType, IMessage, User } from "./interfaces";
import { CreateMessageDTO, ChannelJoinDTO } from "../shared/chat/chat.dto";
import { ClientEvents } from "../shared/client/ClientEvents";

export class ChannelJoinReq {
  id: number;
  approved: boolean;
  channelId: number;
  userId: number;

  constructor(
    id: number,
    approved: boolean,
    channelId: number,
    userId: number,
  ) {
    this.id = id;
    this.approved = approved;
    this.channelId = channelId;
    this.userId = userId;
  }
}

export class Channel implements Chat {
  id: number;
  name: string;
  access: string;
  type: ChatType;

  constructor(id: number, name: string, access: string) {
    this.id = id;
    this.name = name;
    this.access = access;
    this.type = ChatType.CHANNEL;
  }

  postMessage = (socket: Socket | null, msgContent: string) => {
    const msg: CreateMessageDTO = {
      content: msgContent,
      chatId: this.id,
    };

    socket?.emit(ClientEvents.channelMessage, msg);
  };

  postInvit = (socket: Socket | null, msgContent: string) => {
    const msg: CreateMessageDTO = {
      content: msgContent,
      chatId: this.id,
    };

    socket?.emit("InvitPlayerToPlay", msg);
  };

  join = (socket: Socket | null) => {
    let joinDTO;
    if (this.access === "PROTECTED") {
      const pwd = window.prompt("Enter channel password:");
      joinDTO = new ChannelJoinDTO(this.id, pwd);
    } else {
      joinDTO = new ChannelJoinDTO(this.id);
    }
    socket?.emit(ClientEvents.joinChannel, joinDTO);
  };
}

export class PrivateChat implements Chat {
  id: number;
  name: string;
  target: User;
  type: ChatType;

  constructor(id: number, target: User) {
    this.id = id;
    this.name = String(target.username);
    this.target = target;
    this.type = ChatType.PRIVATECHAT;
  }

  postMessage = (socket: Socket | null, msgContent: string) => {
    const msg: CreateMessageDTO = {
      content: msgContent,
      chatId: this.id,
    };

    socket?.emit(ClientEvents.privateMessage, msg);
  };

  postInvit = (socket: Socket | null, msgContent: string) => {
    const msg: CreateMessageDTO = {
      content: msgContent,
      chatId: this.id,
    };

    socket?.emit("InvitPlayerToPlay", msg);
  };

  join = (socket: Socket | null) => {
    socket?.emit(ClientEvents.joinPrivateChat, this.id);
  };
}

export class Message implements IMessage {
  id: number;
  content: string;
  authorId: number;
  chatId: number;
  createdAt: Date;

  constructor(
    id: number,
    content: string,
    authorId: number,
    chatId: number,
    createdAt: Date,
  ) {
    this.id = id;
    this.content = content;
    this.authorId = authorId;
    this.chatId = chatId;
    this.createdAt = createdAt;
  }
}

export class MemberStatus {
  owner: boolean;
  admin: boolean;
  mute: boolean;
  ban: boolean;

  constructor(owner: boolean, admin: boolean, mute: boolean, ban: boolean) {
    this.owner = owner;
    this.admin = admin;
    this.mute = mute;
    this.ban = ban;
  }
}

export class Member implements User {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  avatarLink: string;
  isLogged: boolean;
  isDoneRegister: boolean;

  constructor(
    id: number,
    email: string,
    username: string,
    firstname: string,
    lastname: string,
    avatarLink: string,
    isLogged: boolean,
    isDoneRegister: boolean,
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.firstname = firstname;
    this.lastname = lastname;
    this.avatarLink = avatarLink;
    this.isLogged = isLogged;
    this.isDoneRegister = isDoneRegister;
  }
}
