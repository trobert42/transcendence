import {
  Controller,
  UseGuards,
  Headers,
  Get,
  Res,
  Post,
  Body,
} from "@nestjs/common";
import { GamesService } from "./games.service";
import { JwtGuard } from "src/auth/guard";

@UseGuards(JwtGuard)
@Controller("games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get("all")
  async getAllGames(@Headers() head) {
    const response = await this.gamesService.getAllGames();
    return response;
  }

  @Post("myHistory")
  async getMyGamesHistory(@Body() body) {
    const response = await this.gamesService.getMyGamesHistory(body.userId);
    return response;
  }

  @Get("GamesStats")
  async getStatsForLeaderboard() {
    const response = await this.gamesService.getStatsForLeaderboard();
    return response;
  }

  @Post("createGame")
  async createGame(@Headers() head, @Body() body) {
    const returnMessage = await this.gamesService.createGames(body);
    return returnMessage;
  }

  @Post("gameHistoryAdd")
  async addGameToHistory(@Body() body, @Res() res) {
    const returnMessage: string = await this.gamesService.addGameToHistory(
      body,
    );
    if (returnMessage) {
      res.status(201).send("Game added to history");
    } else {
      res.status(400).send("Game not added to history");
    }
  }

  @Post("gameSettingsInit")
  async gameSettingsInit(@Body() body, @Res() res) {
    const returnMessage: boolean = await this.gamesService.gameSettingsInit(
      body,
    );
    if (returnMessage) {
      res
        .status(201)
        .send({ message: "Game are correctly initialized", success: true });
    } else {
      res.status(400).send({
        message: "Game settings dont respect the rules!",
        success: false,
      });
    }
  }
}
