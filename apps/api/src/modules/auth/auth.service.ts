import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserRepository } from 'src/data/repositories/user.repository';
import { compare, hash } from 'bcrypt';
import { RefreshToken } from './types/refresh.token';
import { User } from 'prisma/generated';
import { AccessToken } from './types/accessToken.type';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto, LoginDto } from '@repo/utils/request';
import { PrivateUserDto } from '@repo/utils/response';
import { plainToInstance } from 'class-transformer';

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

  async createUser(dto: CreateUserDto): Promise<PrivateUserDto> {
    const { email, username, password } = dto;
    const existingUser = await this.userRepository.findIfExists(
      email,
      username,
    );
    if (existingUser)
      throw new BadRequestException(
        `User with this email or username already exists`,
      );
    const passwordHash = await hash(password, 10);
    const user = this.userRepository.create({ email, passwordHash, username });
    return plainToInstance(PrivateUserDto, user);
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken)
      throw new BadRequestException('No refresh token provided');
    const payload = await this.verifyRefreshToken(refreshToken);
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

  private async verifyRefreshToken(token: string) {
    let payload: RefreshToken | AccessToken;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      }
      if (err instanceof JsonWebTokenError) {
        throw new BadRequestException('Invalid refresh token');
      }
      throw err;
    }
    if (payload.type !== 'refresh')
      throw new UnauthorizedException('Invalid refresh token');
    return payload;
  }
}
