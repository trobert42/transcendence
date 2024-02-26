export class MessageDTO {
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

export class CreateMessageDTO {
  content: string;
  chatId: number;

  constructor(content: string, chatId: number) {
    this.content = content;
    this.chatId = chatId;
  }
}

export class UserDTO {
  id: number;
  name: string;
  email: string;
  firstname: string;
  lastname: string;
  avatarLink: string;
  isLogged: boolean;
  isDoneRegister: boolean;

  constructor(
    id: number,
    name: string,
    isLogged: boolean,
    email: string,
    firstname: string,
    lastname: string,
    avatarLink: string,
    isDoneRegister: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.firstname = firstname;
    this.lastname = lastname;
    this.avatarLink = avatarLink;
    this.isLogged = isLogged;
    this.isDoneRegister = isDoneRegister;
  }
}

export class ChannelDTO {
  id: number;
  name: string;
  access: string;

  constructor(id: number, name: string, access: string) {
    this.id = id;
    this.name = name;
    this.access = access;
  }
}

export class CreateChannelDTO {
  name: string;
  access: string;
  pwd: string;

  constructor(name: string, access: string, pwd: string) {
    this.name = name;
    this.access = access;
    this.pwd = pwd;
  }
}

export class UpdateChannelDTO {
  channelId: number;
  chanInfos: CreateChannelDTO;

  constructor(channelId: number, name: string, access: string, pwd: string) {
    this.channelId = channelId;
    this.chanInfos = new CreateChannelDTO(name, access, pwd);
  }
}

export class ChannelJoinDTO {
  channelId: number;
  pwd: string;

  constructor(channelId: number, pwd?: string | null) {
    this.channelId = channelId;
    this.pwd = pwd ? this.pwd = pwd : '';
  }
}

export class ChannelJoinedDTO {
  channelId: number;
  messages: MessageDTO[];
  members: UserDTO[];
  owner: number;
  admins: number[];
  banned: number[];
  muted: number[];
  chatId: number;

  constructor(
    channelID: number,
    messages: MessageDTO[],
    members: UserDTO[],
    owner: number,
    admins: number[],
    banned: number[],
    muted: number[],
    chatId: number,
  ) {
    this.channelId = channelID;
    this.messages = messages;
    this.members = members;
    this.owner = owner;
    this.admins = admins;
    this.banned = banned;
    this.muted = muted;
    this.chatId = chatId;
  }
}

export class PrivateChatDTO {
  id: number;
  target: UserDTO;

  constructor(id: number, target: UserDTO) {
    this.id = id;
    this.target = target;
  }
}

export class PrivateChatJoinDTO {
  id: number;
  messages: MessageDTO[];
  users: UserDTO[];
  chatId: number;

  constructor(
    id: number,
    messages: MessageDTO[],
    users: UserDTO[],
    chatId: number,
  ) {
    this.id = id;
    this.messages = messages;
    this.users = users;
    this.chatId = chatId;
  }
}

export class ChannelUserActionDTO {
  userId: number;
  channelId: number;

  constructor(userId: number, channelId: number) {
    this.userId = userId;
    this.channelId = channelId;
  }
}

export class newChannelMemberDTO {
  user: UserDTO;
  channelId: number;

  constructor(user: UserDTO, channelId: number) {
    this.user = user;
    this.channelId = channelId;
  }
}
