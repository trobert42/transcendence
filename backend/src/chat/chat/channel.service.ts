import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  User,
  Channel,
  AccessMode,
  Message,
  PrivateChat,
  MuteDuration,
  BanDuration,
} from "@prisma/client";
import {
  CreateChannelDTO,
  ChannelJoinDTO,
  UpdateChannelDTO,
} from "../../shared/chat/chat.dto";
import { ChatService } from "./chat.service";
import * as argon2 from "argon2";
import { ChatSocket } from "./chat.interfaces";
import { AccessValidation, CHATERROR } from "./chat.types";
import { DatabaseError } from "./chat.errors";
import { use } from "passport";

@Injectable()
export class ChannelService {
  private clientsChannel: Map<string, number> = new Map();
  private readonly muteDuration_sec = 10;
  private readonly banDuration_sec = 20;

  constructor(
    private prisma: PrismaService,
    private chatService: ChatService
  ) {}

  bindClientToChannel(clientId: string, channelId: number) {
    this.clientsChannel.set(clientId, channelId);
  }

  unbindClientToChannel(clientId: string) {
    this.clientsChannel.delete(clientId);
  }

  async createChannel(
    userId: number,
    channelData: CreateChannelDTO
  ): Promise<Channel> {
    const chat = await this.prisma.chatEntity.create({});
    if (!chat) throw new Error(`chat creation in DB for Channel failed`);

    let accessMode: AccessMode;
    if (channelData.access === "PUBLIC") accessMode = AccessMode.PUBLIC;
    else if (channelData.access === "PROTECTED")
      accessMode = AccessMode.PROTECTED;
    else if (channelData.access === "PRIVATE") accessMode = AccessMode.PRIVATE;
    else console.error("error");

    let hashedPwd: string = "";
    if (accessMode == AccessMode.PROTECTED) {
      if (channelData.pwd) {
        hashedPwd = await argon2.hash(channelData.pwd);
      } else {
        throw new Error(`password for protected channels expected`);
      }
    }

    const newChanel = await this.prisma.channel.create({
      data: {
        name: channelData.name,
        access: accessMode,
        chat: {
          connect: { id: chat.id },
        },
        owner: {
          connect: { id: userId },
        },
        admins: {
          connect: { id: userId },
        },
        members: {
          connect: { id: userId },
        },
        ...(accessMode === AccessMode.PROTECTED && { password: hashedPwd }),
      },
    });

    if (!newChanel) throw new Error("channel creation in DB failed");
    return newChanel;
  }

  async updateChannel(channelId: number, chanInfos: CreateChannelDTO) {
    let accessMode: AccessMode;
    if (chanInfos.access === "PUBLIC") accessMode = AccessMode.PUBLIC;
    else if (chanInfos.access === "PROTECTED")
      accessMode = AccessMode.PROTECTED;
    else if (chanInfos.access === "PRIVATE") accessMode = AccessMode.PRIVATE;
    else console.error("error");

    let hashedPwd: string = "";
    if (accessMode == AccessMode.PROTECTED) {
      if (chanInfos.pwd) {
        hashedPwd = await argon2.hash(chanInfos.pwd);
      } else {
        throw new Error(`password for protected channels expected`);
      }
    }

    const updatedChannel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        name: chanInfos.name,
        access: accessMode,
        ...(accessMode === AccessMode.PROTECTED && { password: hashedPwd }),
      },
    });

    return updatedChannel;
  }

  async deleteChannel(channelId: number): Promise<boolean> {
    try {
      const result = await this.prisma.channel.delete({
        where: { id: channelId },
      });

      if (!result) {
        console.log(`channel #${channelId} not found for deletion`);
        return false;
      }
      return true;
    } catch (error) {
      console.error(
        `Prisma error during deletion of channel #${channelId}: `,
        error
      );
      throw new DatabaseError(error);
    }
  }

  async getAll() {
    try {
      const channels = await this.prisma.channel.findMany({
        include: {
          muteDurations: true,
          banDurations: true,
        },
      });
      return channels;
    } catch (error) {
      console.error("prisma error while retreiving all channels");
      return [];
    }
  }

  async getById(channelId: number): Promise<Channel> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel)
      throw new Error(`can't find channel with id ${channelId} in DB`);
    return channel;
  }

  async getAllBanByUser(userId: number) {}
  async getByIdAllFields(channelId: number) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        members: true,
        admins: true,
        banned: true,
        muted: true,
      },
    });

    if (!channel)
      throw new Error(`can't find channel with id ${channelId} in DB`);
    return channel;
  }

  async getChannelChatId(channelId: number): Promise<number> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel)
      throw new Error(`can't find channel with id ${channelId} in DB`);
    return channel.chatId;
  }

  async getChannelAdmins(channelId: number): Promise<User[]> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { admins: true },
    });

    if (!channel)
      throw new Error(`can't find channel with id ${channelId} in DB`);

    return channel.admins;
  }

  async getChannelMembers(channelId: number): Promise<User[]> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { members: true },
    });

    if (!channel)
      throw new Error(`can't fetch channel with id ${channelId} in DB`);

    return channel.members;
  }

  async retrieveBannedChannelsByUserId(userId: number): Promise<Channel[]> {
    try {
      const publicChannels = await this.prisma.channel.findMany({
        where: {
          banned: {
            some: {
              id: userId,
            },
          },
        },
      });
      return publicChannels;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async retrievePublicChannels(): Promise<Channel[]> {
    try {
      const publicChannels = await this.prisma.channel.findMany({
        where: {
          access: AccessMode.PUBLIC,
        },
      });
      return publicChannels;
    } catch (error) {
      console.error(CHATERROR, "error retrieving public channels: ", error);
      throw new NotFoundException(error);
    }
  }

  async retrieveProtectedChannels(): Promise<Channel[]> {
    try {
      const protectedChannels = await this.prisma.channel.findMany({
        where: {
          access: AccessMode.PROTECTED,
        },
      });
      return protectedChannels;
    } catch (error) {
      console.error(CHATERROR, "error retrieving protected channels: ", error);
      throw new NotFoundException(error);
    }
  }

  async retrievePrivateChannels(userId: number): Promise<Channel[]> {
    try {
      const privateChannels = await this.prisma.channel.findMany({
        where: {
          access: AccessMode.PRIVATE,
        },
      });
      return privateChannels;
    } catch (error) {
      console.error(CHATERROR, "error retrieving private channels: ", error);
      throw new NotFoundException(error);
    }
  }

  async canUserAccessChannel(
    userId: number,
    channelId: number
  ): Promise<boolean> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      select: { access: true, members: true, banned: true },
    });
    if (!channel) return false;
    if (channel.banned.some((user) => user.id === userId)) return false;
    if (channel.access !== AccessMode.PRIVATE) return true;
    if (channel.members.some((mem) => mem.id === userId)) return true;
    return false;
  }

  async checkPwd(userId: number, dto: ChannelJoinDTO): Promise<boolean> {
    console.log("checking password for channel #", dto.channelId);
    const channel = await this.prisma.channel.findUnique({
      where: { id: dto.channelId },
    });
    if (!channel)
      throw new Error(`could not find channel #${dto.channelId} in DB`);

    if (!channel.password) return true;
    if (!dto.pwd) return false;
    if (await argon2.verify(channel.password, dto.pwd)) {
      console.log("pwd verified ok");
      return true;
    }
    console.log("pwd verify NOT ok");
    return false;
  }

  async checkAccessConditions(
    userId: number,
    dto: ChannelJoinDTO
  ): Promise<AccessValidation> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: dto.channelId },
      include: { members: true, banned: true, joinRequests: true },
    });
    if (!channel) {
      throw new Error(`channel #${dto.channelId} cannot be found in DB`);
    }
    if (channel.ownerId === userId) return AccessValidation.OK;
    if (channel.banned.some((user) => user.id === userId))
      return AccessValidation.FAIL;
    if (channel.access === AccessMode.PUBLIC) return AccessValidation.OK;
    if (channel.access === AccessMode.PROTECTED) {
      if (await this.checkPwd(userId, dto)) {
        return AccessValidation.OK;
      }
      return AccessValidation.FAIL;
    }
    if (channel.access === AccessMode.PRIVATE) {
      if (channel.members.some((mem) => mem.id === userId))
        return AccessValidation.OK;
      if (!channel.joinRequests.some((joinReq) => joinReq.userId === userId)) {
        const newJoinRequest = await this.prisma.channelJoinReq.create({
          data: {
            approved: false,
            User: { connect: { id: userId } },
            Channel: { connect: { id: dto.channelId } },
          },
        });
        if (!newJoinRequest)
          throw new DatabaseError(`ChannelJoinRequest creation failed`);
      }
      return AccessValidation.STANDBY;
    }
    return AccessValidation.FAIL;
  }

  async approveUserJoin(userId: number, channelId: number) {
    const result = await this.prisma.channelJoinReq.deleteMany({
      where: {
        userId: userId,
        channelId: channelId,
      },
    });
    if (result) {
      await this.newChannelMember(userId, channelId);
    }
  }

  async retrieveChannelJoinRequests(channelId: number) {
    const joinRequests = await this.prisma.channelJoinReq.findMany({
      where: { channelId: channelId },
    });
    return joinRequests;
  }

  async newChannelMember(userId: number, channelId: number): Promise<boolean> {
    try {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: { members: true },
      });
      if (!channel)
        throw new Error(`Could not fetch channel with id ${channelId} in DB.`);

      if (channel.members.some((mem) => mem.id === userId)) {
        return false;
      }
      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          members: {
            connect: { id: userId },
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Prisma error :", error);
      throw new DatabaseError(error);
    }
  }

  async deleteMember(userId: number, channelId: number): Promise<boolean> {
    try {
      const result = await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
      });
      return true;
    } catch(error) {
      console.error(`Could not delete member user #${userId} in channel #${channelId}: `, error);
      return false;
    }

  }

  async isAdmin(userId: number, channelId: number) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { admins: true },
    });
    if (!channel) throw new Error(`can't find channel ${channelId} in DB`);

    if (channel.admins.some((admin) => admin.id === userId)) {
      return true;
    }
    return false;
  }

  async banUser(userId: number, channelId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        channelsOwned: true,
        channelsBannedFrom: true,
        channelsMemberOf: true,
      },
    });
    if (!user) throw new Error("user targeted for ban does not exist");
    if (user.channelsOwned.some((chan) => chan.id === channelId)) {
      console.log(
        `ban failed: user #${userId} is owner of channel ${channelId}`
      );
      return false;
    }
    if (user.channelsBannedFrom.some((chan) => chan.id === channelId)) {
      console.log(
        `ban failed: user #${userId} is already banned from channel ${channelId}`
      );
      return false;
    }
    if (!user.channelsMemberOf.some((chan) => chan.id === channelId)) {
      console.log(
        `ban failed: user #${userId} is not a member of channel ${channelId}`
      );
      return false;
    }
    const banDuration = await this.createBanDuration(
      userId,
      channelId,
      this.banDuration_sec
    );
    if (!banDuration) return false;
    const updatedChannel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        banned: {
          connect: { id: userId },
        },
      },
    });
    if (!updatedChannel) return false;
    return true;
  }

  async unbanUser(userId: number, channelId: number) {
    await this.deleteBanDuration(userId, channelId);
    await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        banned: {
          disconnect: { id: userId },
        },
      },
    });
  }

  async isUserBanned(userId: number, channelId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { channelsBannedFrom: true },
    });
    if (!user) throw new Error(`user ${userId} not found in DB`);

    if (user.channelsBannedFrom.some((chan) => chan.id === channelId))
      return true;
    return false;
  }

  async muteUser(userId: number, channelId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        channelsOwned: true,
        channelsMutedFrom: true,
        channelsMemberOf: true,
      },
    });
    if (!user) throw new Error("user targeted for mute does not exist");
    if (user.channelsOwned.some((chan) => chan.id === channelId)) {
      console.log(
        `mute failed: user #${userId} is owner of channel ${channelId}`
      );
      return false;
    }
    if (user.channelsMutedFrom.some((chan) => chan.id === channelId)) {
      console.log(
        `mute failed: user #${userId} is already muted in channel ${channelId}`
      );
      return false;
    }
    if (!user.channelsMemberOf.some((chan) => chan.id === channelId)) {
      console.log(
        `ban failed: user #${userId} is not a member of channel ${channelId}`
      );
      return false;
    }
    const muteDuration = await this.createMuteDuration(
      userId,
      channelId,
      this.muteDuration_sec
    );
    if (!muteDuration) return false;
    const updatedChannel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        muted: {
          connect: { id: userId },
        },
      },
    });
    if (!updatedChannel) return false;
    return true;
  }

  async unmuteUser(userId: number, channelId: number) {
    await this.deleteMuteDuration(userId, channelId);
    await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        muted: {
          disconnect: { id: userId },
        },
      },
    });
  }

  async isUserMuted(userId: number, channelId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { channelsMutedFrom: true },
    });
    if (!user) throw new Error(`user ${userId} not found in DB`);

    if (user.channelsMutedFrom.some((chan) => chan.id === channelId))
      return true;
    return false;
  }

  async kickUser(userId: number, channelId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        channelsOwned: true,
        channelsMemberOf: true,
        channelsBannedFrom: true,
      },
    });
    if (!user) throw new Error("user targeted for kick does not exist");
    if (user.channelsOwned.some((chan) => chan.id === channelId)) {
      console.log(
        `kick failed: user #${userId} is owner of channel ${channelId}`
      );
      return false;
    }
    if (!user.channelsMemberOf.some((chan) => chan.id === channelId)) {
      console.log(
        `ban failed: user #${userId} is not a member of channel ${channelId}`
      );
      return false;
    }
    if (user.channelsBannedFrom.some((chan) => chan.id === channelId)) {
      console.log(
        `ban failed: user #${userId} is banned from channel ${channelId}`
      );
      return false;
    }
    return true;
  }

  async isOwner(userId: number, channelId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        channelsOwned: true,
      },
    });
    if (!user) return false;
    if (user.channelsOwned.some((chan) => chan.id === channelId)) return true;
    return false;
  }

  async promoteUser(userId: number, channelId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        channelsOwned: true,
        channelsMemberOf: true,
        channelsBannedFrom: true,
      },
    });
    if (!user) throw new Error("user up for promotion does not exist");
    if (!user.channelsMemberOf.some((chan) => chan.id === channelId)) {
      console.log(
        `ban failed: user #${userId} is not a member of channel ${channelId}`
      );
      return false;
    }
    if (user.channelsBannedFrom.some((chan) => chan.id === channelId)) {
      console.log(
        `ban failed: user #${userId} is banned from channel ${channelId}`
      );
      return false;
    }

    const updatedChannel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        admins: {
          connect: { id: userId },
        },
      },
    });
    if (!updatedChannel) return false;
    return true;
  }

  async demoteUser(userId: number, channelId: number) {
    const updatedChannel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        admins: {
          disconnect: { id: userId },
        },
      },
    });
    if (!updatedChannel) return false;
    return true;
  }

  async changeOwner(userId: number, channeId: number): Promise<number> {
    try {
      const updateChannel = await this.prisma.channel.update({
        where: { id: channeId },
        data: {
          owner: {
            disconnect: { id: userId },
          },
        },
      });
      return 0;
    } catch (error) {
      console.error("prisma error while change channel owner", error);
    }
  }

  async createMuteDuration(
    userId: number,
    channelId: number,
    durationInSec: number
  ): Promise<MuteDuration> {
    const muteDuration = await this.prisma.muteDuration.create({
      data: {
        until: new Date(Date.now() + durationInSec * 1000),
        User: { connect: { id: userId } },
        Channel: { connect: { id: channelId } },
      },
    });
    return muteDuration;
  }

  async createBanDuration(
    userId: number,
    channelId: number,
    durationInSec: number
  ): Promise<BanDuration> {
    const banDuration = await this.prisma.banDuration.create({
      data: {
        until: new Date(Date.now() + durationInSec * 1000),
        User: { connect: { id: userId } },
        Channel: { connect: { id: channelId } },
      },
    });
    return banDuration;
  }

  async getExpiredMuteDurations(): Promise<MuteDuration[]> {
    try {
      const durations = await this.prisma.muteDuration.findMany({
        where: {
          until: {
            lte: new Date(),
          },
        },
      });
      return durations;
    } catch (error) {
      console.error(
        "prisma error while fetching expired mute durations :",
        error
      );
      return [];
    }
  }

  async getExpiredBanDurations(): Promise<BanDuration[]> {
    try {
      const durations = await this.prisma.banDuration.findMany({
        where: {
          until: {
            lte: new Date(),
          },
        },
      });
      return durations;
    } catch (error) {
      console.error(
        "prisma error while fetching expired ban durations :",
        error
      );
      return [];
    }
  }

  async deleteMuteDurationById(durationId: number) {
    await this.prisma.muteDuration.delete({
      where: { id: durationId },
    });
  }

  async deleteMuteDuration(userId: number, channelId: number) {
    await this.prisma.muteDuration.deleteMany({
      where: {
        userId: userId,
        channelId: channelId,
      },
    });
  }

  async deleteBanDurationById(durationId: number) {
    await this.prisma.banDuration.delete({
      where: { id: durationId },
    });
  }

  async deleteBanDuration(userId: number, channelId: number) {
    await this.prisma.banDuration.deleteMany({
      where: {
        userId: userId,
        channelId: channelId,
      },
    });
  }
}
