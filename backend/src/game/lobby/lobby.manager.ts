import { Server } from "socket.io";
import { ClientSocket } from "../../utils/SocketTypes";
import { Lobby } from "./lobby";
import { User } from "@prisma/client";
import { ServerException } from "src/utils/ServerExceptions";
import { SocketExceptions } from "../../shared/server/SocketExceptions";
import { ServerEvents } from "../../shared/server/ServerEvents";
import { GamesService } from "../../games/games.service";
import { PrismaService } from "src/prisma/prisma.service";

export class LobbyManager {
  constructor() {}

  public server: Server;

  private lobbies: Map<Lobby["id"], Lobby> = new Map<Lobby["id"], Lobby>();

  public initializeSocket(client: ClientSocket) {
    client.data.lobby = null;
    client.data.playerId = 0;
    if (
      !client?.handshake?.query.username ||
      !client?.handshake?.query.userId
    ) {
      client.emit(ServerEvents.LobbyGameMessage, {
        color: "orange",
        message: "Error in data value, refesh page please 😲",
      });
      return false;
    }
    client.data.userName = client?.handshake?.query.username;
    client.data.userId = client?.handshake?.query.userId;
    return true;
  }

  public async removeClientSocket(client: ClientSocket) {
    await client.data?.lobby?.removePlayer(client);
    this.removeLobby(client.data?.lobby);
  }

  public checkFreeLobby(gameSettings: any): string {
    if (this.lobbies.size >= 1) {
      for (const [id, lobbi] of this.lobbies) {
        if (!lobbi.room) this.lobbies.delete(lobbi?.id);
        else if (
          lobbi?.gameSettings?.gameMode === gameSettings.gameMode &&
          lobbi?.gameSettings?.roundNumber === gameSettings.roundNumber &&
          lobbi?.gameSettings?.options === gameSettings.options &&
          lobbi?.gameSettings?.friendInvite !== true &&
          lobbi.players.size < 2
        ) {
          return lobbi.id;
        }
      }
    }
    return undefined;
  }

  public listAllLobby(): any {
    console.log("listAllLobby, this.lobbies.size:", this.lobbies.size);
    for (const [id, lobbi] of this.lobbies) {
      console.log("listAllLobby, lobbi.id:", id);
    }
    return undefined;
  }

  public checkPlayerLobby(client: ClientSocket): any {
    for (const [id, lobbi] of this.lobbies) {
      for (const [id, player] of lobbi.players) {
        if (client?.data?.userName === player?.data?.userName) {
          return 1;
        }
      }
    }
    return undefined;
  }

  public async createLobby(
    gameSettings: any,
    prismaService: PrismaService,
    gamesService: GamesService,
  ): Promise<Lobby> {
    const lobby = new Lobby(
      gameSettings,
      this.server,
      this,
      gamesService,
      prismaService,
    );

    this.lobbies.set(lobby.id, lobby);

    return lobby;
  }

  public joinLobby(lobbyId: string, client: ClientSocket): void {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby) {
      throw new ServerException(SocketExceptions.LobbyError, "Lobby not found");
    }

    if (lobby.players.size >= 2) {
      throw new ServerException(
        SocketExceptions.LobbyError,
        "Lobby already full",
      );
    }

    if (lobby.players.size === 0) {
      client.emit(ServerEvents.LobbyGameMessage, {
        color: "green",
        message: "Lobby created 😁",
      });
    }
    lobby.addPlayer(client);
    client.emit(ServerEvents.LobbyState, {
      lobbyStatus: true,
    });
  }

  public removeLobby(lobby: Lobby): void {
    lobby?.players.forEach((player) => {
      this.initializeSocket(player);
    });
    if (lobby?.id) this.lobbies.delete(lobby?.id);
  }

  public deleteLobby(lobbyId: string): void {
    this.lobbies.delete(lobbyId);
  }
}
