import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/data/repositories/user.repository';
import { compare } from 'bcrypt';
import { RefreshToken } from './types/refresh.token';
import { User } from 'prisma/generated';
import { AccessToken } from './types/accessToken.type';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '@repo/utils/request';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async login(payload: LoginDto) {
    const user = await this.userRepository.findByEmail(payload.email);
    if (!user) throw new NotFoundException('User not found');
    const isCorrect = await compare(payload.password, user.passwordHash);
    if (!isCorrect) throw new UnauthorizedException('Wrong email or password');
    const result = await Promise.all([
      this.generateRefreshToken(user),
      this.generateAccessToken(user),
    ]);
    return result;
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken)
      throw new BadRequestException('No refresh token provided');
    const payload: RefreshToken | AccessToken =
      await this.jwtService.verifyAsync(refreshToken);
    if (payload.type !== 'refresh')
      throw new UnauthorizedException('Invalid refresh token');
    const user = await this.userRepository.findById(payload.sub);
    if (!user) throw new NotFoundException('User not found');
    const accessToken = await this.generateAccessToken(user);
    return { accessToken };
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload: RefreshToken = { sub: user.id, type: 'refresh' };
    const ttl = this.configService.get<number>('jwt.refreshTtl');
    return await this.jwtService.signAsync(payload, { expiresIn: ttl });
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload: AccessToken = { sub: user.id, type: 'access' };
    const ttl = this.configService.get<number>('jwt.ttl');
    return await this.jwtService.signAsync(payload, { expiresIn: ttl });
  }
}
