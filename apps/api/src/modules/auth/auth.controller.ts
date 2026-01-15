import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/common/decorators/public';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import { CreateUserDto, LoginDto } from '@repo/utils/request';
import { PrivateUserDto } from '@repo/utils/response';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('/login')
  async login(@Body() dto: LoginDto, @Res() res: FastifyReply) {
    const [refreshToken, accessToken] = await this.authService.login(dto);
    res.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      path: '/auth',
      secure: true,
      sameSite: 'strict',
      maxAge: this.configService.get<number>('jwt.refreshTtl')! / 1000,
    });
    return res.send({ accessToken });
  }

  @Public()
  @Get('/refresh')
  async refresh(@Req() req: FastifyRequest) {
    return await this.authService.refresh(req.cookies.refresh_token);
  }

  @Public()
  @Post('/signup')
  create(@Body() dto: CreateUserDto): Promise<PrivateUserDto> {
    return this.authService.createUser(dto);
  }
}
