import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly user: UserService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshJwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
      ignoreExpiration: false, // Enforce token expiration checking
      passReqToCallback: true, // Pass the request object to the callback
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && 'refresh-token' in req.cookies) {
      return req.cookies['refresh-token'];
    }
    return null;
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    if (req.cookies['refresh-token']) {
      const refreshToken = req.cookies['refresh-token'];
      return this.user.getUserIfRefreshTokenMatches(refreshToken, payload.sub);
    } else {
      return this.prisma.user.findUnique({ where: { email: payload.sub } });
    }
  }
}
