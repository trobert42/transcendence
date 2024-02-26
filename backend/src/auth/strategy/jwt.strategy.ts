import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.get('JWT_SECRET'),
      ignoreExpiration: false, // Enforce token expiration checking
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && 'token' in req.cookies) {
      return req.cookies.token;
    }
    return null;
  }

  async validate(payload: { sub: string; email: string }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: payload.sub,
        },
        include: {
          blockedUsers: true,
        },
      });
      if (user?.hash) delete user.hash;
      return user;
    } catch (err) {
      throw err;
    }
  }
}
