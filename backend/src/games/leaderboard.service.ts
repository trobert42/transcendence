import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Leaderboard } from '@prisma/client';
import { HttpService } from '@nestjs/axios';

interface IncrementProps {
  leaderboardId: string;
  dataName: string;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTheLeaderBoard(dataId: Leaderboard['id']): Promise<Leaderboard> {
    const leaderboard: any = await this.prismaService.leaderboard.findUnique({
      where: { id: dataId },
    });

    return leaderboard;
  }

  async getLeaderBoards(): Promise<Leaderboard[]> {
    const leaderboard: Leaderboard[] = await this.prismaService.leaderboard.findMany();
    if (!leaderboard) {
      return null;
    }

    return leaderboard;
  }

  async createLeaderboard(): Promise<Leaderboard> {
    const leaderboard: Leaderboard = await this.prismaService.leaderboard.create(
      {
        data: {
          gamesPlayed: 0,
        },
      },
    );
    return leaderboard;
  }

  async incrementObjectNumberValue(
    props: IncrementProps,
  ): Promise<Leaderboard> {
    const leaderboard: Leaderboard = await this.prismaService.leaderboard.update(
      {
        where: { id: props.leaderboardId },
        data: {
          [props.dataName]: {
            increment: 1,
          },
        },
      },
    );

    return leaderboard;
  }

  async decrementObjectNumberValue(
    props: IncrementProps,
  ): Promise<Leaderboard> {
    const leaderboard: Leaderboard = await this.prismaService.leaderboard.update(
      {
        where: { id: props.leaderboardId },
        data: {
          [props.dataName]: {
            decrement: 1,
          },
        },
      },
    );

    return leaderboard;
  }
}
