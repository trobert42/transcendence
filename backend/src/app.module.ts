import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './game/game.module';
import { GamesModule } from './games/games.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { ChatModule } from './chat/chat/chat.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { Lobby } from './game/lobby/lobby';
import { LobbyManager } from './game/lobby/lobby.manager';
import { UserMiddleware } from './user/user.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    GameModule,
    PassportModule,
    ChatModule,
    GamesModule,
    Lobby,
    LobbyManager,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('api/channels/*');
    consumer.apply(AuthMiddleware).forRoutes('api/private-chats/*');
    consumer.apply(AuthMiddleware).forRoutes('api/private-chats');
    consumer.apply(UserMiddleware).forRoutes('users/profile/:id');
  }
}
