import { Prisma } from '@prisma/client';

export class User implements Prisma.UserCreateInput {
  id?: string;
  email: string;
  username: string;
  hash: string;
  firstname: string;
  lastname: string;

  refreshToken: string;

  avatarLink: string;
  isLogged: boolean;
  is2FAEnabled: boolean;
  is42User: boolean;
  access42Token: string;
  twoFASecret: string;

  isDoneRegister: boolean;
}
