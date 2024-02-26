import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  WsResponse,
} from "@nestjs/websockets";
import { Namespace, Server, Socket } from "socket.io";
import { ClientEvents } from "../shared/client/ClientEvents";
import { ServerEvents } from "../shared/server/ServerEvents";
import { ClientSocket } from "../utils/SocketTypes";
import { ServerPayload } from "../shared/server/ServerPayload";
import { LobbyManager } from "./lobby/lobby.manager";
import { Logger } from "@nestjs/common";
import { ServerException } from "src/utils/ServerExceptions";
import { SocketExceptions } from "../shared/server/SocketExceptions";
import { v4 as uuidv4 } from "uuid";
import GameService from "./game.service";
import { JwtGuard } from "src/auth/guard";
import { UseGuards } from "@nestjs/common";
import { PaddleMoveDto } from "./dto";
import { PrismaService } from "src/prisma/prisma.service";
import { GamesService } from "src/games/games.service";

export interface Message {
  content: string;
  to: string;
  from: string;
}

@WebSocketGateway({ namespace: "/pong", cors: true })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger = new Logger(GameGateway.name);
  constructor(
    private readonly gamesService: GamesService,
    private readonly prisma: PrismaService,
    private readonly lobbyManager: LobbyManager,
  ) {}

  afterInit(server: Server): any {
    this.lobbyManager.server = server;
    this.logger.log("Game server correctly started !");
  }

  private clients = new Map<string, Socket>();

  async handleConnection(
    @ConnectedSocket() client: ClientSocket,
    ...props: any[]
  ): Promise<void> {
    let username = client.handshake.query.username;
    if (Array.isArray(username)) {
      username = username[0];
    }
    client.data = props;
    this.clients.set(username, client);
    this.lobbyManager.initializeSocket(client);
  }

  async handleDisconnect(
    @ConnectedSocket() client: Socket,
    ...args: any[]
  ): Promise<void> {
    client.on("disconnect", (reason: any) => {
      console.log(`Client disc onnected: ${client.id}, reason: ${reason}`);
    });

    let username = client.handshake.query.username;
    if (Array.isArray(username)) {
      username = username[0];
    }

    await this.lobbyManager.removeClientSocket(client);
    try {
      if (client.data.userId) {
        await this.prisma.user.update({
          where: { id: Number(client.data.userId) },
          data: { isInGame: false },
        });
      }
      this.lobbyManager.initializeSocket(client);
      this.clients.delete(username);
      this.lobbyManager.listAllLobby();
    } catch (error) {}
  }

  @SubscribeMessage(ClientEvents.CreateLobby)
  async onLobbyCreate(
    client: ClientSocket,
    ...args: any[]
  ): Promise<WsResponse<ServerPayload[ServerEvents.LobbyGameMessage]> | any> {
    return new Promise(async (resolve, reject) => {
      try {
        const currendLobbyID = this.lobbyManager.checkPlayerLobby(client);
        if (currendLobbyID) {
          client.emit(ServerEvents.LobbyState, {
            alreadyInLobby: false,
          });
          resolve({
            event: ServerEvents.LobbyGameMessage,
            data: {
              color: "red",
              message: "You are already in a lobby 🤨",
            },
          });
          return;
        }

        const freeLobbyID = this.lobbyManager.checkFreeLobby(args[0]);
        if (freeLobbyID) {
          await this.prisma.user.update({
            where: { id: Number(client.data.userId) },
            data: { isInGame: true },
          });
          resolve(this.lobbyManager.joinLobby(freeLobbyID, client));
        } else {
          const lobby = await this.lobbyManager.createLobby(
            args[0],
            this.prisma,
            this.gamesService,
          );
          lobby.addPlayer(client);
          await this.prisma.user.update({
            where: { id: Number(client.data.userId) },
            data: { isInGame: true },
          });
          resolve({
            event: ServerEvents.LobbyGameMessage,
            data: {
              color: "green",
              message: "Lobby created 😁",
            },
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  @SubscribeMessage(ClientEvents.JoinLobby)
  onLobbyJoin(client: ClientSocket, data: any): void {
    try {
      this.lobbyManager.initializeSocket(client);

      const currendLobbyID = this.lobbyManager.checkPlayerLobby(client);
      if (currendLobbyID) {
        client.emit(ServerEvents.LobbyGameMessage, {
          color: "red",
          message: "You are already in a lobby 🤨",
        });
        return;
      }

      this.lobbyManager.joinLobby(data.lobbyId, client);
    } catch (error) {
      if (error instanceof ServerException) {
        client.emit(ServerEvents.LobbyGameMessage, {
          color: "orange",
          message: error.message,
        });
      } else {
        throw error;
      }
    }
  }

  @SubscribeMessage(ClientEvents.LeaveLobby)
  async onLobbyLeave(client: ClientSocket) {
    await client?.data?.lobby?.removePlayer(client);
  }

  @SubscribeMessage(ClientEvents.MoovePaddle)
  onGamePaddleMoove(
    @ConnectedSocket() client: ClientSocket,
    @MessageBody() keyInfo: PaddleMoveDto,
  ): void {
    if (client && client.data && !client.data.lobby) {
      throw new ServerException(
        SocketExceptions.LobbyError,
        "You are not in a lobby",
      );
    }
    if (client && client?.data?.lobby && client?.data?.lobby?.room) {
      client.data.lobby.room.gamePaddleEvent(
        keyInfo.userId,
        keyInfo.type,
        client,
      );
    }
  }

  private emitToAll(eventName: string, data: any): void {
    this.clients.forEach((socket: Socket) => {
      socket.emit(eventName, data);
    });
  }

  async emitDataToAllSockets(data: string[], data2: string[]) {
    this.emitToAll("yourEventName", data);
  }

  @SubscribeMessage(ClientEvents.Ping)
  onPing(client: ClientSocket) {
    this.lobbyManager.listAllLobby();
    client?.data?.lobby?.server
      .to(client?.data?.lobby?.id)
      .emit(ServerEvents.Pong, {
        message: "pong",
      });
    this.lobbyManager.checkPlayerLobby(client);
    client.emit(ServerEvents.Pong, {
      message:
        "pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong pong ",
    });
  }

  @SubscribeMessage("getActiveSockets")
  handleGetActiveSockets(): { ids: string[]; allUsernames: string[] } {
    const allUsernames = Array.from(
      (this.clients.keys() as unknown) as string[],
    ).map((id) => id);
    const socketIds: string[] = [];
    this.clients.forEach((socket: Socket, id: string) => {
      socketIds.push(socket.id);
    });

    this.emitDataToAllSockets(socketIds, allUsernames);

    return { ids: socketIds, allUsernames: allUsernames };
  }

  @SubscribeMessage("myEvent")
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): void {
    console.log("Received message from client:", data);
    client.emit("responseEvent", "Hell o from server!");
  }

  async createGameWithoutSocket(...args: any[]): Promise<string> {
    try {
      if (!args[0]) return null;
      const lobby = await this.lobbyManager.createLobby(
        args[0],
        this.prisma,
        this.gamesService,
      );
      if (!lobby) return null;

      return lobby.id;
    } catch (error) {}
  }
}
