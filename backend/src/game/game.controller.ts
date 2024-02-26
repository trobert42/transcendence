import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { GameGateway } from "./game.gateway";

@UseGuards(JwtGuard)
@Controller("game")
export class GameController {
  constructor(private readonly gameGateway: GameGateway) {}

  @Post("initGameFriend")
  async createGameFriend(@Body() body) {
    const data = body;
    const response = await this.gameGateway.createGameWithoutSocket(
      data.gameSettings,
    );

    console.log("on createGameFriend, response=", response);
    return response;
  }
}
