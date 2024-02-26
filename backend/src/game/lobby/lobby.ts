import { v4 } from "uuid";
import { Server, Socket } from "socket.io";
import { ServerEvents } from "../../shared/server/ServerEvents";
import { ClientSocket } from "../../utils/SocketTypes";
import { ServerPayload } from "../../shared/server/ServerPayload";
import { Room } from "./room";
import { GamesService } from "../../games/games.service";
import { PrismaService } from "src/prisma/prisma.service";
import { LobbyManager } from "./lobby.manager";

export class Lobby {
  public room: Room = new Room(this);

  public readonly id: string = v4();

  public readonly players: Map<ClientSocket["id"], ClientSocket> = new Map<
    ClientSocket["id"],
    ClientSocket
  >();

  constructor(
    public readonly gameSettings?: any,
    public server?: Server,
    private readonly lobbyManager?: LobbyManager,
    private gamesService?: GamesService,
    private prismaService?: PrismaService,
  ) {}

  injectPrismaService(prismaService: PrismaService): void {
    this.prismaService = prismaService;
  }

  injectGamesService(gamesService: GamesService): void {
    this.gamesService = gamesService;
  }

  public emitToLobby<T>(event: ServerEvents, payload: T): void {
    this.server.to(this.id).emit(event, payload);
  }

  public sendStateToLobby(): void {
    if (!this.room) {
      return;
    }
    const payload: ServerPayload[ServerEvents.LobbyState] = this?.room
      .roomState;

    this.sendStateToRoomPlayers(ServerEvents.LobbyState, payload);
  }

  public sendStateToRoomPlayers<T>(event: ServerEvents, payload: T): void {
    this.server.to(this.id).emit(event, payload);
  }

  public addPlayer(client: ClientSocket) {
    this.players.set(client.id, client);
    client.join(this.id);
    client.data.playerId = 0;
    client.data.lobby = this;

    if (this.players.size >= 2) {
      this.room.startRoom();
    }
  }

  public async removePlayer(client: ClientSocket) {
    try {
      this.players.delete(client.id);
      client.leave(this.id);

      const rageQuitPlayer = client.data.userName;

      if (!this?.room?.roomState.gameFinish) {
        this.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
          ServerEvents.LobbyGameMessage,
          {
            color: "blue",
            message: rageQuitPlayer + " left the lobby 🤫",
          },
        );
      }
      if (this.room) {
        const keepScore = structuredClone(this.room.roomState);
        this?.room.finishRoom();

        await this.searchRoomWinnerAfterDeco(client, keepScore);

        this.sendStateToLobby();
      }
      this.sendStateToRoomPlayers(ServerEvents.LobbyState, {
        lobbyState: null,
      });
      this.room = null;
      this.removeAllPlayersFromLobby();
      this.lobbyManager.deleteLobby(this.id);
    } catch (error) {
      this.sendStateToRoomPlayers(ServerEvents.LobbyState, {
        lobbyState: null,
      });
      this.room = null;
      this.lobbyManager.deleteLobby(this.id);
    }
  }

  public async gameFinishByStats() {
    try {
      if (!this.room) return;
      const keepScore = structuredClone(this.room.roomState);

      this?.room.finishRoom();

      await this.searchRoomWinnerByStats(keepScore);

      this.sendStateToLobby();
      //INSERER UNE FONCTION
      this.sendStateToRoomPlayers(ServerEvents.LobbyState, {
        lobbyState: null,
      });
      this.room = null;
      this.removeAllPlayersFromLobby();
      this.lobbyManager.deleteLobby(this.id);
    } catch (error) {
      this.sendStateToRoomPlayers(ServerEvents.LobbyState, {
        lobbyState: null,
      });
      this.room = null;
      this.lobbyManager.deleteLobby(this.id);
    }
  }

  public async removeAllPlayersFromLobby() {
    for (const [_, clientSocket] of this.players) {
      clientSocket.leave(this.id);
      this.resetSocketData(clientSocket);
      try {
        await this.prismaService.user.update({
          where: { id: Number(clientSocket.data.userId) },
          data: { isInGame: false },
        });
      } catch (error) {}
    }
    this.players.clear();
  }

  public resetSocketData(player: ClientSocket): void {
    player.data.lobby = null;
    player.data.userName = player?.handshake?.query.username;
    player.data.userId = player?.handshake?.query.userId;
    player.data.playerId = 0;
  }

  public gameFinishByScore() {
    if (!this.room) return;

    this?.room.finishRoom();

    this.searchRoomWinnerByScore();

    this.sendStateToLobby();
    this.sendStateToRoomPlayers(ServerEvents.LobbyState, {
      lobbyState: null,
    });
    this.room = null;
  }

  public async searchRoomWinnerAfterDeco(client: ClientSocket, keepScore: any) {
    if (!keepScore?.scores.size) {
      let winner: string = "";
      for (const [id, player] of this.players) {
        if (
          client.data.playerId !== player.data.playerId &&
          player.data.playerId !== 0
        ) {
          winner = player.data.userName;
          keepScore.winner = player.data.userId;
        }
      }
      keepScore.looser = client.data.userId;

      await this.gamesService.addGameToHistory(keepScore);

      const winnerName = await this.searchRoomWinnerName(
        parseInt(keepScore.winner),
      );

      this.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
        ServerEvents.LobbyGameMessage,
        {
          color: "blue",
          message: winnerName + " won the game ! 👏",
        },
      );
    }
  }

  public async searchRoomWinnerName(score: number) {
    const winnerUser = await this.gamesService.getGameWinnerName(score);
    return winnerUser;
  }

  public async searchRoomWinnerByStats(scoresaved: any) {
    scoresaved.winner =
      scoresaved.stats.player2_goals > scoresaved.stats.player1_goals
        ? scoresaved.player2_id
        : scoresaved.player1_id;

    scoresaved.looser =
      scoresaved.player1_id === scoresaved.winner
        ? scoresaved.player2_id
        : scoresaved.player1_id;

    await this.gamesService.addGameToHistory(scoresaved);
    const winnerName = await this.searchRoomWinnerName(
      parseInt(scoresaved.winner),
    );
    this.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
      ServerEvents.LobbyGameMessage,
      {
        color: "blue",
        message: winnerName + " won the game ! 👏",
      },
    );

    //INSERER CANVAS
    this.emitToLobby<ServerPayload[ServerEvents.LobbyGameWinner]>(
      ServerEvents.LobbyGameWinner,
      {
        winner: winnerName,
      },
    );
    let sec = 5;
    const sendWinnerTnterval = async () => {
      return new Promise<void>((resolve) => {
        const intervalId = setInterval(async () => {
          if (sec >= 2) {
            sec--;
          } else {
            clearInterval(intervalId);
            resolve();
          }
        }, 1000);
      });
    };
    await sendWinnerTnterval();
    this.emitToLobby<ServerPayload[ServerEvents.LobbyGameWinner]>(
      ServerEvents.LobbyGameWinner,
      null,
    );
  }

  public async searchRoomWinnerByScore() {
    if (!this?.room?.roomState?.scores.size) {
      let winnerId: number = 0;
      let winnerSocketId: string = "";
      let looserSocketId: string = "";
      let highestScore: number = -Infinity;
      let lowestScore: number = Infinity;
      let equalScores = true;
      let previousScore: number | null = null;

      for (const [id, score] of Object.entries(this.room.roomState.scores)) {
        previousScore = score as number;

        if ((score as number) > highestScore) {
          highestScore = score as number;
          winnerSocketId = id;
        }
        if ((score as number) < lowestScore) {
          lowestScore = score as number;
          looserSocketId = id;
        }
      }
      if (lowestScore === highestScore) {
        equalScores = false;
      }

      if (!equalScores) {
        this.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
          ServerEvents.LobbyGameMessage,
          {
            color: "blue",
            message: "All players won the game ! 👏",
          },
        );
      } else {
        for (const [id, player] of this.players) {
          if (winnerSocketId === player.data.playerId) {
            winnerId = player.data.userId;
          }
        }
        const winnerUser = await this.prismaService.user.findUnique({
          where: { id: winnerId },
        });
        const winnerName = winnerUser.username;
        this.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
          ServerEvents.LobbyGameMessage,
          {
            color: "blue",
            message: winnerName + " won the game ! 👏",
          },
        );
      }
    } else {
      this.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
        ServerEvents.LobbyGameMessage,
        {
          color: "orange",
          message: "Abnormal scores value detected ! 🫨",
        },
      );
    }
  }
}
