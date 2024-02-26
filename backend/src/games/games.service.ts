import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Games } from "@prisma/client";
import { GamesSettings } from "src/utils/GamesTypes";
import { Leaderboard } from "@prisma/client";
import { LeaderboardService } from "./leaderboard.service";

@Injectable()
export class GamesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  async createGames(game: Games): Promise<boolean> {
    const leaderboard: Leaderboard[] = await this.leaderboardService.getLeaderBoards();

    if (leaderboard || leaderboard.length === 0) {
      this.leaderboardService.createLeaderboard();
    }
    if (
      game === undefined ||
      game.player1 <= 0 ||
      game.player2 <= 0 ||
      game.winner <= 0 ||
      game.player1 === game.player2
    ) {
      return false;
    }
    if (game.player1 !== game.winner && game.player2 !== game.winner) {
      return false;
    }

    const gamesCreated = await this.prismaService.games.create({
      data: {
        player1: game.player1,
        player2: game.player2,
        resultatStatut: game.resultatStatut,
        scorePlayer1: game.scorePlayer1,
        scorePlayer2: game.scorePlayer2,
        leaderboard: {
          connect: {
            id: leaderboard[0].id,
          },
        },
        winnerUser: {
          connect: { id: game.winner },
        },
        otherUser: {
          connect: { id: game.looser },
        },
      },
    });
    return true;
  }

  async gameSettingsInit(gameSettings: GamesSettings): Promise<boolean> {
    try {
      if (gameSettings === undefined) {
        return false;
      }
      for (const property in gameSettings) {
        if (gameSettings[property] === undefined) {
          return false;
        }
        gameSettings[property].forEach((value: boolean) => {
          if (typeof value !== "boolean") {
            return false;
          }
        });
        if (Array.isArray(gameSettings[property])) {
          if (property === "difficulty") {
            if (
              gameSettings[property].length !== 2 ||
              gameSettings[property].filter((value: boolean) => value === true)
                .length !== 1
            ) {
              return false;
            }
          } else if (
            gameSettings[property].length !== 3 ||
            gameSettings[property].filter((value: boolean) => value === true)
              .length > 3
          ) {
            return false;
          }
        }
      }
    } catch (error) {
      throw new Error("Error in backend server : " + error);
    }
    return true;
  }

  async getGameWinnerName(winnerId: number): Promise<string> {
    const winnerUser = await this.prismaService.user.findUnique({
      where: { id: winnerId },
      select: { username: true },
    });
    return winnerUser.username;
  }

  async addGameToHistory(game: any) {
    let userName: string = null;
    let leaderboardId: string = null;
    const leaderboard: Leaderboard[] = await this.leaderboardService.getLeaderBoards();
    try {
      if (!leaderboard || leaderboard?.length === 0) {
        let leaderboard = await this.leaderboardService.createLeaderboard();
        leaderboardId = leaderboard.id;
      } else leaderboardId = leaderboard[0].id;
      if (
        game === undefined ||
        game.player1_id <= 0 ||
        game.player2_id <= 0 ||
        game.winner <= 0
      ) {
        return null;
      }
      if (game.player1_id !== game.winner && game.player2_id !== game.winner) {
        return null;
      }
      const winnerUser = await this.prismaService.user.findUnique({
        where: { id: parseInt(game.winner) },
        select: { username: true },
      });
      if (winnerUser === null) {
        return null;
      } else {
        userName = winnerUser.username;
      }
      const gameCreated = await this.prismaService.games.create({
        data: {
          player1: parseInt(game.player1_id),
          player2: parseInt(game.player2_id),
          resultatStatut: game.resultat,
          scorePlayer1: game.stats.player1_goals,
          scorePlayer2: game.stats.player2_goals,
          leaderboard: {
            connect: {
              id: leaderboardId,
            },
          },
          winnerUser: {
            connect: { id: parseInt(game.winner) },
          },
          otherUser: {
            connect: { id: parseInt(game.looser) },
          },
        },
      });
      if (gameCreated) {
        const leaderboardUpdated = await this.leaderboardService.incrementObjectNumberValue(
          {
            leaderboardId: leaderboardId,
            dataName: "gamesPlayed",
          },
        );
      }
    } catch (error) {
      throw new Error("Error in backend server : " + error);
    }
  }

  async getAllGames(): Promise<Games[]> {
    const games: Games[] = await this.prismaService.games.findMany();

    return games;
  }

  async getStatsForLeaderboard(): Promise<any[]> {
    const gamesWon = await this.prismaService.games.groupBy({
      by: ["winner"],
      _count: true,
    });

    const gamesLost = await this.prismaService.games.groupBy({
      by: ["looser"],
      _count: true,
    });

    const totalGamesByPlayer = {};

    gamesWon.forEach((game) => {
      totalGamesByPlayer[game.winner] = game._count;
    });

    gamesLost.forEach((game) => {
      if (totalGamesByPlayer[game.looser]) {
        totalGamesByPlayer[game.looser] += game._count;
      } else {
        totalGamesByPlayer[game.looser] = game._count;
      }
    });

    const players = await Promise.all(
      Object.keys(totalGamesByPlayer).map(async (playerId) => {
        const gamesWonByPlayer = gamesWon.find(
          (game) => game.winner === parseInt(playerId),
        );
        const gamesLostByPlayer = gamesLost.find(
          (game) => game.looser === parseInt(playerId),
        );

        return {
          playerId: playerId,
          user: await this.prismaService.user.findUnique({
            where: { id: parseInt(playerId) },
            select: { username: true, avatarLink: true },
          }),
          totalGames: totalGamesByPlayer[playerId],
          gamesWon: gamesWonByPlayer ? gamesWonByPlayer._count : 0,
          gamesLost: gamesLostByPlayer ? gamesLostByPlayer._count : 0,
        };
      }),
    );

    players.sort((a, b) => b.gamesWon - a.gamesWon);

    return players;
  }

  async getMyGamesHistory(userid: number): Promise<Games[]> {
    const games: any | any[] = await this.prismaService.games.findMany({
      where: {
        OR: [
          {
            player1: {
              equals: userid,
            },
          },
          {
            player2: {
              equals: userid,
            },
          },
        ],
      },
      select: {
        gameDate: true,
        player1: true,
        player2: true,
        scorePlayer1: true,
        scorePlayer2: true,
        winner: true,
        looser: true,
        winnerUser: {
          select: {
            id: true,
            username: true,
            avatarLink: true,
          },
        },
        otherUser: {
          select: {
            id: true,
            username: true,
            avatarLink: true,
          },
        },
      },
      orderBy: {
        gameDate: "desc",
      },
    });

    return games;
  }
}
