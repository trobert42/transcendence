import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Req,
  Res,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { EditUserDto, EditUserFirstLoginDto } from 'src/auth/dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileFilter } from 'src/utils/ImageFileFilter';
import { FileFilterCallback } from 'multer';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly user: UserService) {}

  /////// FIND USER ///////
  @Get('me')
  async getMe(@Req() req) {
    return req.user;
  }

  @Get()
  async getAllUsers(@Req() req) {
    return this.user.getAllUsers(req.user['email']);
  }

  /////// FRIENDS ///////
  @Get('get-friends')
  async getFriends(@Req() req) {
    return this.user.getFriends(req.user['email']);
  }

  @Get('get-pending-friends')
  async getPendingFriends(@Req() req) {
    return this.user.getPendingFriends(req.user['email']);
  }

  @Post('add-friend')
  async addFriend(@Req() req, @Body('friendId') friendId: number) {
    return this.user.beFriend(req.user, friendId);
  }

  @Post('accept-friend')
  async acceptFriend(
    @Req() req,
    @Body('friendId', new ParseIntPipe()) friendId: number,
  ) {
    return this.user.acceptFriend(req.user, friendId);
  }

  @Post('reject-friend')
  async rejectFriend(
    @Req() req,
    @Body('friendId', new ParseIntPipe()) friendId: number,
  ) {
    return this.user.rejectFriend(req.user, friendId);
  }

  @Post('remove-friend')
  async removeFriend(
    @Req() req,
    @Body('friendId', new ParseIntPipe()) friendId: number,
  ) {
    return this.user.removeFriend(req.user, friendId);
  }

  @Post('are-friends')
  async areFriends(
    @Body('authId', new ParseIntPipe()) authId: number,
    @Body('userId', new ParseIntPipe()) userId: number,
  ) {
    return this.user.areFriends(authId, userId);
  }

  /////// EDIT USER ///////
  @Post('edit-user-first-login')
  editUserFirstLogin(@Req() req, @Body() body: EditUserDto) {
    return this.user.editUser(req.user, body);
  }

  @Post('edit-user')
  editUser(@Req() req, @Body() body: EditUserDto) {
    return this.user.editUser(req.user, body);
  }

  @Post('edit-avatar')
  @UseInterceptors(
    FileInterceptor('picture', {
      dest: './public/images/uploaded_pictures',
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      fileFilter: (req, file: Express.Multer.File, cb: FileFilterCallback) => {
        const imageFileFilter = new ImageFileFilter();
        imageFileFilter.filter(req, file, cb);
      },
    }),
  )
  async editAvatarPicture(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Wrong file or not uploaded 🤔');
    }
    const imageFileFilter = new ImageFileFilter();
    const fileIntegrityResult = await imageFileFilter.magicalNumbersChecker(
      req,
      file,
    );
    if (!fileIntegrityResult) {
      throw new BadRequestException('File integrity error 💩');
    }
    return await this.user.editAvatarPicture(req.user, file);
  }

  @Get('setup-default-profile')
  async getDefaultDataProfile(@Req() req) {
    return await this.user.getDefaultDataProfile(req.user);
  }

  @Get('profile_pictures/:id')
  async getImage(@Req() req, @Res() res, @Param('id') id: string) {
    if (id.startsWith("profile_pic"))
      res.sendFile(process.cwd() + '/public/images/profile_pictures/' + id);
    else
      res.sendFile(process.cwd() + '/public/images/uploaded_pictures/' + id);
  }

  @Get('/profile/:id')
  async getUser(@Param('id', new ParseIntPipe()) id, @Req() req) {
    return this.user.getUserById(id);
  }

  @Patch('block/:id')
  async blockUser(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.user.blockUser(req.user, id);
  }

  @Patch('unblock/:id')
  async unblockUser(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.user.unblockUser(req.user, id);
  }
}
