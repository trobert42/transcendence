import {
  ChannelJoinedDTO,
  CreateChannelDTO,
  CreateMessageDTO,
  MessageDTO,
  UserDTO,
  ChannelDTO,
  PrivateChatDTO,
  UpdateChannelDTO,
  ChannelJoinDTO,
  ChannelUserActionDTO,
} from '../../shared/chat/chat.dto';
import { User, Message, Channel } from '@prisma/client';
import { PrivateChat } from './chat.types';
import { IsDate, IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, MaxLength, MinLength, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessageValidationDTO extends CreateMessageDTO {
  @IsString({ message: 'Content must be a string' })
  @MinLength(1, { message: 'Content must not be empty' })
  @MaxLength(1024, { message: 'Content is too long' })
  content: string;

  @IsInt({ message: 'Chat ID must be an integer' })
  chatId: number;
}

export class CreateChannelValidationDTO extends CreateChannelDTO {
  @IsString({ message: 'Name must be a string'})
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(64, { message: 'Name is too long' })
  name: string;

  @IsString({ message: 'Access must be a string' })
  @IsIn(['PUBLIC', 'PROTECTED', 'PRIVATE'], { message: 'Invalid access value' })
  access: string;

  @IsString({ message: 'Password must be a string' })
  @ValidateIf((o) => o.access === 'PROTECTED')
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(32, { message: 'Password is too long' })
  @IsOptional()
  pwd: string;
}

export class UpdateChannelValidationDTO extends UpdateChannelDTO {
  @IsInt({ message: 'Channel ID must be an integer' })
  channelId: number;

  @IsObject({ message: 'Invalid channel information' })
  @ValidateNested({ each: true })
  @Type(() => CreateChannelValidationDTO)
  chanInfos: CreateChannelDTO;
}

export class ChannelJoinValidationDTO extends ChannelJoinDTO {
  @IsInt({ message: 'Channel ID must be a number' })
  channelId: number;

  @IsString({ message: 'Password must be a string' })
  @MaxLength(32, { message: 'Password is too long' })
  @IsOptional()
  pwd: string;
}

export class ChannelUserActionValidationDTO extends ChannelUserActionDTO {
  @IsInt({ message: 'User ID must be an int' })
  userId: number;

  @IsInt({ message: 'Channel ID must be an int' })
  channelId: number;
}


export function formatUserToDTO(user: User): UserDTO {
  return new UserDTO(
    user.id,
    user.username,
    user.isLogged,
    user.email,
    user.firstname,
    user.lastname,
    user.avatarLink,
    user.isDoneRegister,
  );
}

export function formatMessageToDTO(msg: Message): MessageDTO {
  return new MessageDTO(
    msg.id,
    msg.content,
    msg.authorId,
    msg.chatPostedInId,
    msg.createdAt,
  );
}

export function formatChannelToDTO(channel: Channel): ChannelDTO {
  return new ChannelDTO(channel.id, channel.name, channel.access);
}

export function formatPrivateChatToDTO(
  userId: number,
  privateChat: PrivateChat,
): PrivateChatDTO {
  if (!privateChat) return null;
  const target = privateChat.users.find((user) => user.id !== userId);
  return new PrivateChatDTO(privateChat.id, formatUserToDTO(target));
}
