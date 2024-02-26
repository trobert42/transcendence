import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { HttpModule } from '@nestjs/axios';
import { LeaderboardService } from './leaderboard.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [GamesController],
  providers: [GamesService, LeaderboardService],
  exports: [GamesService],
})
export class GamesModule {}
