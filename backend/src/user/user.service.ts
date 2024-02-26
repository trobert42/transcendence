import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto, EmailDto, LoginDto } from 'src/auth/dto';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  /////// FIND USER ///////
  async getAllUsers(actualUserEmail: string) {
    const actualUser = await this.prisma.user.findUnique({
      where: {
        email: actualUserEmail,
      },
      include: {
        blockedUsers: true,
      },
    });

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        isLogged: true,
        avatarLink: true,
        isDoneRegister: true,
        isInGame: true,
      },
    });
    if (users) {
      const usersWithBlockedStatus = users.map((user) => {
        const isBlocked = actualUser.blockedUsers.some(
          (blockedUser) => blockedUser.id === user.id,
        );
        return { ...user, isBlocked };
      });
      return usersWithBlockedStatus;
    }
    return users;
  }

  async getUserByEmail(email: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!foundUser) throw new NotFoundException(`Can't find user`);
    delete foundUser.hash;
    return foundUser;
  }

  async getUserByUsername(username: string) {
    if (!username)
      throw new NotFoundException(`Invalid username: can't be empty`);
    const foundUser = await this.prisma.user.findUnique({
      where: { username },
    });
    return foundUser;
  }

  async getUserById(id: number) {
    if (!id) throw new NotFoundException(`Invalid id: can't find user`);
    const foundUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!foundUser) throw new NotFoundException(`Can't find user`);
    return foundUser;
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, email: string) {
    const foundUser = await this.getUserByEmail(email);
    const isRefreshTokenMatching = await argon2.verify(
      foundUser.refreshToken,
      refreshToken,
    );
    if (isRefreshTokenMatching) {
      return foundUser;
    }
  }

  /////// FRIENDS ///////

  async getFriends(email: string) {
    const actualUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        friendshipsInitiated: {
          where: { accepted: true },
          select: { receiver: true },
        },
        friendshipsReceived: {
          where: { accepted: true },
          select: { initiator: true },
        },
      },
    });

    const initiatedFriends = actualUser.friendshipsInitiated.map(
      (friendship) => friendship.receiver,
    );
    const receivedFriends = actualUser.friendshipsReceived.map(
      (friendship) => friendship.initiator,
    );

    const friends = [...initiatedFriends, ...receivedFriends];

    return friends;
  }

  async isReceiver(userId: number, otherUserId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        friendshipsReceived: {
          where: { initiatorId: otherUserId, accepted: false },
        },
      },
    });
    if (user.friendshipsReceived.length > 0) return true;
    return false;
  }

  async getPendingFriends(email: string) {
    const actualUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        friendshipsInitiated: {
          where: { accepted: false },
          select: { receiver: true },
        },
        friendshipsReceived: {
          where: { accepted: false },
          select: { initiator: true },
        },
      },
    });

    const initiatedFriends = actualUser.friendshipsInitiated.map(
      (friendship) => ({ ...friendship.receiver, isReceiver: true }),
    );
    const receivedFriends = actualUser.friendshipsReceived.map(
      (friendship) => ({ ...friendship.initiator, isReceiver: false }),
    );

    const friends = [...initiatedFriends, ...receivedFriends];
    return friends;
  }

  async beFriend(actualUser: User, newFriendId: number) {
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: actualUser.id, receiverId: newFriendId },
          { initiatorId: newFriendId, receiverId: actualUser.id },
        ],
      },
    });
    if (existingFriendship) {
      return;
    }
    const friend = await this.getUserById(newFriendId);

    if (!friend) {
      throw new NotFoundException(`Friend doesn't exist`);
    }
    await this.prisma.friendship.create({
      data: {
        initiatorId: actualUser.id,
        receiverId: friend.id,
        accepted: false,
      },
    });
    return { ...friend, isReceiver: true };
  }

  async acceptFriend(actualUser: User, newFriendId: number) {
    const existingRelationship = await this.prisma.friendship.findFirst({
      where: {
        initiatorId: newFriendId,
        receiverId: actualUser.id,
        accepted: false,
      },
    });
    if (!existingRelationship) {
      return null;
    }

    if (existingRelationship) {
      await this.prisma.friendship.update({
        where: { id: existingRelationship.id },
        data: { accepted: true },
      });
    }
  }

  async rejectFriend(actualUser: User, newFriendId: number) {
    const existingRelationship = await this.prisma.friendship.findFirst({
      where: {
        initiatorId: newFriendId,
        receiverId: actualUser.id,
        accepted: false,
      },
    });
    if (!existingRelationship) {
      return null;
    }

    if (existingRelationship) {
      await this.prisma.friendship.delete({
        where: { id: existingRelationship.id },
      });
    }
  }

  async removeFriend(actualUser: User, newFriendId: number) {
    const existingRelationship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            initiatorId: actualUser.id,
            receiverId: newFriendId,
          },
          {
            initiatorId: newFriendId,
            receiverId: actualUser.id,
          },
        ],
        accepted: true,
      },
    });
    if (!existingRelationship) {
      return null;
    }
    await this.prisma.friendship.deleteMany({
      where: { id: existingRelationship.id },
    });
  }

  async areFriends(authId: number, userId: number) {
    const existingRelationship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            initiatorId: authId,
            receiverId: userId,
          },
          {
            initiatorId: userId,
            receiverId: authId,
          },
        ],
        accepted: true,
      },
    });
    if (!existingRelationship) {
      return false;
    }
    return true;
  }

  /////// EDIT USER ///////
  async updateUserDatas(
    email: string,
    newRefreshToken: string,
    isLogged: boolean,
  ): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: {
        refreshToken: newRefreshToken,
        isLogged: isLogged,
      },
    });
    return updatedUser;
  }

  async updateUserFirstLogin(
    email: string,
    isDoneRegister: boolean,
  ): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: {
        isDoneRegister: isDoneRegister,
      },
    });
    return updatedUser;
  }

  async editUser(user: User, body: EditUserDto) {
    const foundUsername = await this.prisma.user.findUnique({
      where: {
        username: body['username'],
      },
    });
    if (foundUsername && (body['username'] != foundUsername.username)) {
      throw new ConflictException('Username is already taken');
    } else {
      const data: any = {
        username: body['username'],
        firstname: body['firstname'],
        lastname: body['lastname'],
        isLogged: true,
      };

      if ('isDoneRegister' in body) {
        data.isDoneRegister = body['isDoneRegister'];
      }
      const updatedUser = await this.prisma.user.update({
        where: { email: user.email },
        data: data,
      });
      return updatedUser;
    }
  }

  async editAvatarPicture(actualUser: User, file: Express.Multer.File) {
    if (actualUser.avatarLink !== file.originalname) {
      const dirPath = './public/images/profile_pictures';
      const profilePicture = new URL(
        `${file.filename}`,
        process.env.REACT_APP_SITE_URL + ':3333/users/profile_pictures/',
      ).href;
      const updatedUser = await this.prisma.user.update({
        where: { email: actualUser.email },
        data: {
          avatarLink: profilePicture,
        },
      });
      return updatedUser;
    }
  }

  async getDefaultDataProfile(actualUser: User) {
    try {
      if (actualUser.is42User) {
        const response = await axios.get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${actualUser.access42Token}`,
          },
        });

        const foundUser = await this.getUserByUsername(response.data.login);
        let newUsername = response.data.login;
        if (foundUser && foundUser.email !== actualUser.email) {
          newUsername = actualUser.username;
        }
        const updatedUser = await this.prisma.user.update({
          where: { email: actualUser.email },
          data: {
            username: newUsername,
            firstname: response.data.first_name,
            lastname: response.data.last_name,
            avatarLink: response.data.image.link,
            isDoneRegister: true,
            isLogged: true,
            is2FAEnabled: false,
          },
        });

        if (foundUser && foundUser.email !== actualUser.email) {
          return { updatedUser, isUsernameAvailable: false };
        } else {
          return { updatedUser, isUsernameAvailable: true };
        }
      }
    } catch (err) {
      if (err.status === 409) {
        throw new ConflictException('Username already taken');
      } else if (err.status === 500) {
        throw new UnauthorizedException(`Internal server error`);
      } else {
        throw new UnauthorizedException(`Can't access to 42 API`);
      }
    }
  }

  async checkUserCredentials(dto: LoginDto) {
    const { email, password } = dto;

    if (email.endsWith('@student.42.fr')) {
      throw new ForbiddenException(
        'Emails ending with @student.42.fr are not allowed, please signin with 42api',
      );
    }

    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!foundUser) throw new UnauthorizedException('Credentials incorrect');

    const pwMatches = await argon2.verify(foundUser.hash, dto.password);
    if (!pwMatches) throw new UnauthorizedException('Credentials incorrect');
    return foundUser.is2FAEnabled;
  }

  async checkFirstSigninUserCredentials(dto: EditUserDto) {
    const foundUsername = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });
    if (foundUsername) throw new ConflictException('Credentials already taken');
    return foundUsername;
  }

  async checkEmail(dto: EmailDto): Promise<any> {
    if (dto.email.endsWith('@student.42.fr')) {
      throw new ForbiddenException(
        'Emails ending with @student.42.fr are not allowed, please signin with 42api',
      );
    }
    const foundEmail = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (foundEmail) return { emailAvailable: false };
    return { emailAvailable: true };
  }

  async blockUser(user: User, targetId: number) {
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        blockedUsers: {
          connect: { id: targetId },
        },
      },
    });
    if (!updatedUser)
      throw new HttpException(
        `update of user #${user.id} in DB failed`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return updatedUser;
  }

  async unblockUser(user: User, targetId: number) {
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        blockedUsers: {
          disconnect: { id: targetId },
        },
      },
    });
    if (!updatedUser)
      throw new HttpException(
        `update of user #${user.id} in DB failed`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return updatedUser;
  }
}
