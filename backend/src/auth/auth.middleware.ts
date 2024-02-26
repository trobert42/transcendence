import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(@Req() req: Request, @Res() res: Response, next: NextFunction) {
    console.log(req.originalUrl);
    const cookies =
      req.headers.cookie?.split(';').map((cookie) => cookie.trim()) || [];
    const tokenCookie = cookies.find((cookie) => cookie.startsWith('token='));
    const token = tokenCookie?.split('=')[1];
    if (token) {
      const user: User = await this.authService.identifyClient(token);
      if (user) {
        req['user'] = user;
      }
    }

    next();
  }
}
