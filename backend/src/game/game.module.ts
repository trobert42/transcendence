import { Module } from "@nestjs/common";
import GameService from "./game.service";
import { GameGateway } from "./game.gateway";
import { Lobby } from "./lobby/lobby";
import { LobbyManager } from "./lobby/lobby.manager";
import { GamesModule } from "src/games/games.module";
import { PrismaService } from "src/prisma/prisma.service";
import { GamesService } from "src/games/games.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { GameController } from "./game.controller";

@Module({
  controllers: [GameController],
  imports: [PrismaModule, GamesModule],
  providers: [GameService, GameGateway, PrismaService, Lobby, LobbyManager],
})
export class GameModule {}
