import { Controller, Get, HttpException, HttpStatus, InternalServerErrorException, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChannelDTO, PrivateChatDTO } from '../../shared/chat/chat.dto';
import { Request } from 'express';
import { ChannelService } from './channel.service';
import { ChannelJoinReq } from '@prisma/client';

@Controller('api/channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly chatService: ChatService,
  ) {}

  @Get('banned')
  async getUserBannedChannels(@Req() req): Promise<number[]> {
    console.log(`Fetching banned channels for user with ID ${req.user.id}`);
    const bannedChannels = await this.channelService.retrieveBannedChannelsByUserId(req.user.id);
    console.log(bannedChannels);
    const bannedChannelIds: number[] = bannedChannels.map(channel => channel.id);
    return bannedChannelIds;
  }

  @Get('public')
  async getUserMemberPublicChannels(@Req() req): Promise<ChannelDTO[]> {
    console.log('fetch public channels asked by client ', req.user.id);
    const publicChannels = await this.channelService.retrievePublicChannels();
    const channelsDTO: ChannelDTO[] = publicChannels.map(
      (channel) => new ChannelDTO(channel.id, channel.name, channel.access),
    );
    return channelsDTO;
  }

  @Get('private')
  async getUserMemberPrivateChannels(@Req() req): Promise<ChannelDTO[]> {
    console.log('fetch private channels asked by client ', req.user.id);
    const privateChannels = await this.channelService.retrievePrivateChannels(
      req.user.id,
    );
    const channelsDTO: ChannelDTO[] = privateChannels.map(
      (channel) => new ChannelDTO(channel.id, channel.name, channel.access),
    );
    return channelsDTO;
  }

  @Get('protected')
  async getUserMemberProtectedChannels(@Req() req): Promise<ChannelDTO[]> {
    console.log('fetch protected channels asked by client ', req.user.id);
    const protectedChannels = await this.channelService.retrieveProtectedChannels();
    const channelsDTO: ChannelDTO[] = protectedChannels.map(
      (channel) => new ChannelDTO(channel.id, channel.name, channel.access),
    );
    return channelsDTO;
  }

  @Get()
  async getUserMemberChannels(@Req() req): Promise<ChannelDTO[]> {
    console.log('fetch protected channels asked by client ', req.user.id);
    const channels = await this.channelService.retrievePublicChannels();
    channels.push(...await this.channelService.retrieveProtectedChannels());
    channels.push(...await this.channelService.retrievePrivateChannels(req.user.id));
    const channelsDTO: ChannelDTO[] = channels.map(
      (channel) => new ChannelDTO(channel.id, channel.name, channel.access),
    );
    return channelsDTO;
  }

  @Get(':id/join-requests')
  async getChannelJoinRequests(@Param('id', ParseIntPipe) channelId: number, @Req() req): Promise<ChannelJoinReq[]> {
      console.log('fetch channel join requests requested by user ', req.user.id);
      if (!await this.channelService.isOwner(req.user.id, channelId)) {
        throw new HttpException('user is not channel owner', HttpStatus.FORBIDDEN);
      }
      return await this.channelService.retrieveChannelJoinRequests(channelId);
  }
}
