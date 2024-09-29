import { AuthenticatedRequest } from './auth.service';
import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './auth.entity';
import { JwtAuthGuard } from './auth.guard';
import { LoginDto } from './login.dto';
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // token version
  // @Post('signin')
  // @ApiOkResponse({ type: AuthEntity })
  // login(@Body() { email, password }: LoginDto) {
  //   return this.authService.login(email, password);
  // }

  //cookie version
  @Post('signin')
  @ApiOkResponse({ type: AuthEntity })
  async signin(
    @Body() { login, password }: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const authEntity = await this.authService.login(login, password);
    res
      .cookie('Tickly', authEntity.token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 1 * 24 * 60 * 1000), //1 jour
      })
      .send(authEntity);
  }

  @Post('signout')
  @ApiOkResponse()
  async signout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie('Tickly').send();
  }

  @Get('session')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: AuthEntity })
  async authSession(@Req() request: AuthenticatedRequest): Promise<AuthEntity> {
    return this.authService.getUserInfo(request);
  }
}
