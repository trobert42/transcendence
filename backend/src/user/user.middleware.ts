import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const id = req.params.id;
    if (!Number.isInteger(parseInt(id))) {
      throw new BadRequestException('Invalid ID');
    }
    next();
  }
}
