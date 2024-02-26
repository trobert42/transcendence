import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Profile, Strategy } from 'passport-42';
import { AuthService } from '../auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FTStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private readonly config: ConfigService,
    private readonly user: UserService,
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) { 
    super({
      clientID: config.get('API_42_UID'),
      clientSecret: config.get('API_42_PWD'),
      callbackURL: config.get('API_42_CALLBACK_URI'),
      Scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    let user = await this.prisma.user.findFirst({
      where: {
        email: profile.emails[0].value,
      },
    });
    if (!user) {
      const dto = {
        email: profile.emails[0].value,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        access42Token: accessToken,
        password: uuidv4(),
      };

      const email = profile.emails[0].value;
      await this.auth.signup(dto);
      await this.prisma.user.update({
        where: { email },
        data: {
          is42User: true,
        },
      });
      user = await this.user.getUserByEmail(profile.emails[0].value);
    }
    return user || null;
  }
}
