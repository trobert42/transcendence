import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, EmailDto, Login2FADto, LoginDto } from './dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { Request, Response } from 'express';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import * as fs from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private user: UserService,
  ) {}

  async signup(body: AuthDto): Promise<any> {
    const existingEmail = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (existingEmail) {
      throw new ConflictException('Credentials taken');
    }

    const hash = await argon2.hash(body.password);
    const tokens = await this.getTokens(body.email);
    if (!tokens)
      throw new InternalServerErrorException('Unable to retrieve tokens');

    const refreshToken = await argon2.hash(tokens.refreshToken);
    const avatarLink = this.getRandomProfilePicture();
    let newRandomUsername = this.generateRandomUsername();
    let access42Token = body.access42Token ? body.access42Token : '';

    await this.prisma.user.create({
      data: {
        email: body.email,
        username: newRandomUsername,
        firstname: body.firstname,
        lastname: body.lastname,
        refreshToken,
        access42Token: access42Token,
        avatarLink,
        twoFASecret: '',
        hash,
      },
    });
    return newRandomUsername;
  }

  getRandomProfilePicture() {
    const dirPath = './public/images/profile_pictures';
    const files = fs.readdirSync(dirPath);
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const profilePicture = new URL(
      randomFile,
      this.config.get('SITE_URL') +':3333/users/profile_pictures/',
    ).href;
    return profilePicture;
  }

  async signinLocal(dto: LoginDto, res: Response): Promise<any> {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new ConflictException('Credentials taken');

    const pwMatches = await argon2.verify(user.hash, dto.password);
    if (!pwMatches) throw new ConflictException('Credentials taken');

    const tokens = await this.getTokens(user.email);
    if (!tokens)
      throw new InternalServerErrorException('Unable to retrieve tokens');

    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
    });
    res.cookie('refresh-token', tokens.refreshToken, {
      httpOnly: true,
    });

    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);
    let isLogged = user.isDoneRegister ? true : false;
    await this.user.updateUserDatas(email, hashedRefreshToken, isLogged);

    res.send({
      message: `Logged in successfully :D ${tokens.refreshToken}`,
      email: user.email,
      id: user.id,
      username: user.username,
      lastname: user.lastname,
      firstname: user.firstname,
      accessToken: tokens.accessToken,
      refreshToken: hashedRefreshToken,
      isLogged: isLogged,
      access42Token: user.access42Token,
      isDoneRegister: user.isDoneRegister,
    });
  }

  async signout(res: Response, email: string) {
    if (email) {
      await this.prisma.user.update({
        where: { email },
        data: {
          isLogged: false,
        },
      });
    }
    res.clearCookie('refresh-token');
    res.clearCookie('token');
    return res.send({ message: 'Logged out successfully' });
  }

  async getTokens(email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        {
          sub: email,
        },
        {
          secret: this.config.get('JWT_SECRET'),
          expiresIn: '1d',
        },
      ),
      this.jwt.signAsync(
        {
          sub: email,
        },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  async refreshTokens(email: string) {
    const tokens = await this.getTokens(email);
    return tokens.accessToken;
  }

  /////// 42 API AUTH ///////
  async signin42(
    dto: EmailDto,
    res: Response,
    newAcessToken: string,
  ): Promise<any> {
    const { email } = dto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new ForbiddenException('Credentials incorrect');

    const tokens = await this.getTokens(user.email);
    if (!tokens)
      throw new InternalServerErrorException('Unable to retrieve tokens');

    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
    });
    res.cookie('refresh-token', tokens.refreshToken, {
      httpOnly: true,
    });

    if (user.is2FAEnabled) {
      res.redirect(this.config.get('SITE_URL') + ':3000/auth/2fa/42signin');
      return;
    }
    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);
    if (user.isDoneRegister) {
      await this.user.updateUserDatas(
        email,
        hashedRefreshToken,
        true,
      );
      res.redirect(this.config.get('SITE_URL') +':3000/');
    } else {
      await this.user.updateUserDatas(
        email,
        hashedRefreshToken,
        false,
      );
      res.redirect(this.config.get('SITE_URL') +':3000/auth/first-login');
    }
  }

  async signin42with2FA(
    user: User,
    res: Response,
    qrCode: string,
    newAcessToken: string,
  ): Promise<any> {
    const isCodeValid = this.is2FACodeValid(user, qrCode);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authenticate code');
    }
    const tokens = await this.getTokens(user.email);
    if (!tokens)
      throw new InternalServerErrorException('Unable to retrieve tokens');

    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
    });
    res.cookie('refresh-token', tokens.refreshToken, {
      httpOnly: true,
    });

    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);
    await this.user.updateUserDatas(
      user.email,
      hashedRefreshToken,
      true,
    );
    return user;
  }

  /////// 2FA AUTH ///////
  async update2FA(email: string, is2FAEnabled: boolean) {
    await this.prisma.user.update({
      where: { email },
      data: {
        is2FAEnabled: is2FAEnabled,
      },
    });
  }

  async generate2FASecret(email: string) {
    try {
      const secret = authenticator.generateSecret();
      const optAuthUrl = authenticator.keyuri(
        email,
        this.config.get('AUTH_2FA_APP'),
        secret,
      );
      await this.prisma.user.update({
        where: { email },
        data: {
          twoFASecret: secret,
        },
      });
      return { secret, optAuthUrl };
    } catch (err) {
      throw err;
    }
  }

  async getQrCode(user: User) {
    try {
      if (!user.is2FAEnabled) {
        const data = await this.generate2FASecret(user.email);
        return await toDataURL(data.optAuthUrl);
      }
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to generate secret for 2FA',
      );
    }
  }

  is2FACodeValid(user: User, code: string) {
    return authenticator.verify({
      token: code,
      secret: user.twoFASecret,
    });
  }

  async signin2FA(dto: Login2FADto, res: Response) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new UnauthorizedException('Credentials incorrect');

    const pwMatches = await argon2.verify(user.hash, dto.password);
    if (!pwMatches) throw new UnauthorizedException('Credentials incorrect');

    const isCodeValid = this.is2FACodeValid(user, dto.code);
    if (!isCodeValid)
      throw new UnauthorizedException('Wrong authenticate code');

    const tokens = await this.getTokens(user.email);
    if (!tokens)
      throw new InternalServerErrorException('Unable to retrieve tokens');

    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
    });
    res.cookie('refresh-token', tokens.refreshToken, {
      httpOnly: true,
    });

    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);
    await this.user.updateUserDatas(email, hashedRefreshToken, true);
    res.send({
      message: `Logged in successfully :D ${tokens.refreshToken}`,
      email: user.email,
      id: user.id,
      username: user.username,
      lastname: user.lastname,
      firstname: user.firstname,
      accessToken: tokens.accessToken,
      refreshToken: hashedRefreshToken,
      isLogged: user.isLogged,
      access42Token: user.access42Token,
    });
  }

  async getUserFromSocket(client: Socket): Promise<User> {
    const authorization = client.handshake.headers.authorization;
    const token = authorization && authorization.split(' ')[1];
    if (!token) return null;

    const payload = this.jwt.verify(token, {
      secret: this.config.get('JWT_SECRET'),
    });
    if (!payload) return null;

    const user = await this.user.getUserByEmail(payload.sub).catch(() => null);
    if (!user) return null;
    return user;
  }

  async identifyClient(token: string): Promise<User> {
    if (!token) return null;

    const payload = this.jwt.verify(token, {
      secret: this.config.get('JWT_SECRET'),
    });
    if (!payload) return null;

    const user = await this.user.getUserByEmail(payload.sub).catch(() => null);
    if (!user) return null;
    return user;
  }

  async getActualAccessToken(req: Request, res: Response) {
    if (req.cookies && 'token' in req.cookies) {
      const token = req.cookies.token;
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      if (!payload) return null;
      return res.send({ accessToken: token });
    }
    return null;
  }

  /////// UTILS ///////
  generateRandomUsername(length = 10) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
