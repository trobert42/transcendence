import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
  Res,
  Query,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { AuthDto, EditUserDto, EmailDto, Login2FADto, LoginDto } from "./dto";
import { FTAuthGuard, JwtGuard, RefreshJwtGuard } from "./guard";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("auth")
export class AuthController {
  constructor(
    private auth: AuthService,
    private user: UserService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  @Post("signup")
  async signup(@Body() dto: AuthDto) {
    await this.auth.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("local-signin")
  async signin(@Body() dto: LoginDto, @Res() res) {
    return await this.auth.signinLocal(dto, res);
  }

  @UseGuards(JwtGuard)
  @Get("signout")
  signout(@Res() res, @Req() req) {
    let verifyProps: any;
    if (!req.user) {
      verifyProps = this.auth.signout(res, null);
    } else {
      verifyProps = this.auth.signout(res, req.user["email"]);
    }
    return verifyProps;
  }

  /////// JWT REFRESH TOKEN ///////
  @UseGuards(RefreshJwtGuard)
  @Get("refresh")
  async refreshToken(@Req() req, @Res() res) {
    const accessToken = await this.auth.refreshTokens(req.user["email"]);
    res.cookie("token", accessToken, {
      httpOnly: true,
    });
    res.send({ accessToken: accessToken });
  }

  /////// 42 API AUTH ///////
  @Get("42")
  @UseGuards(FTAuthGuard)
  auth42() {}

  @Get("redirect") //callback
  @UseGuards(FTAuthGuard)
  async auth42redirect(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Query("code") newAcessToken,
  ) {
    const dto = { email: req.user.email };
    return await this.auth.signin42(dto, res, newAcessToken);
  }

  @UseGuards(JwtGuard)
  @Post("2fa/42-signin")
  async signin42with2FA(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Body() body,
    @Query("code") newAcessToken,
  ) {
    return await this.auth.signin42with2FA(
      req.user,
      res,
      body["qrCode"],
      newAcessToken,
    );
  }

  /////// 2FA AUTH ///////
  @HttpCode(HttpStatus.OK)
  @Post("2fa/signin")
  async signin2FA(@Body() dto: Login2FADto, @Res() res) {
    return await this.auth.signin2FA(dto, res);
  }

  @Post("2fa/update")
  @UseGuards(JwtGuard)
  async update2FA(@Req() req, @Body() body) {
    return this.auth.update2FA(req.user["email"], body["status2FA"]);
  }

  @Get("2fa/get-qr-code")
  @UseGuards(JwtGuard)
  async getQrCode(@Req() req) {
    return this.auth.getQrCode(req.user);
  }

  @Post("2fa/verify-qr-code")
  @UseGuards(JwtGuard)
  async verifyQrCode(@Req() req, @Body() body) {
    return this.auth.is2FACodeValid(req.user, body["qrCode"]);
  }

  /////// CHECK AUTH ///////
  @Post("check-signin")
  checkUserCredentials(@Body() dto: LoginDto) {
    return this.user.checkUserCredentials(dto);
  }

  @UseGuards(JwtGuard)
  @Post("check-first-signin")
  checkFirstSigninUserCredentials(@Body() dto: EditUserDto) {
    return this.user.checkFirstSigninUserCredentials(dto);
  }

  @Post("check-email")
  async checkEmail(@Body() dto: EmailDto) {
    return await this.user.checkEmail(dto);
  }

  @UseGuards(JwtGuard)
  @Get("myToken")
  async getToken(@Req() req, @Res() res) {
    return await this.auth.getActualAccessToken(req, res);
  }
}
