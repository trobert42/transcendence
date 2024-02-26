import {
  ChannelDTO,
  MessageDTO,
  UserDTO,
  PrivateChatDTO,
} from '../shared/chat/chat.dto';
import { Channel, Member, Message, PrivateChat } from './chatClasses';

export function getChannelFromChannelDTO(dto: ChannelDTO): Channel {
  return new Channel(dto.id, dto.name, dto.access);
}

export function getMessageFromMessageDTO(dto: MessageDTO): Message {
  return new Message(
    dto.id,
    dto.content,
    dto.authorId,
    dto.chatId,
    dto.createdAt,
  );
}

export function getMemberFromUserDTO(dto: UserDTO): Member {
  return new Member(
    dto.id,
    dto.email,
    dto.name,
    dto.firstname,
    dto.lastname,
    dto.avatarLink,
    dto.isLogged,
    dto.isDoneRegister,
  );
}

export function getPrivateChatFromDTO(dto: PrivateChatDTO): PrivateChat {
  return new PrivateChat(dto.id, getMemberFromUserDTO(dto.target));
}
