import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { FTStrategy, JwtStrategy, RefreshJwtStrategy } from './strategy';
import { UserService } from 'src/user/user.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { FTAuthGuard } from './guard';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    UserModule,
    PassportModule.register({ session: false }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    RefreshJwtStrategy,
    FTStrategy,
    FTAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
