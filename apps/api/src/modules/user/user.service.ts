import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/data/repositories/user.repository';
import { createHash } from 'crypto';
import { validateAvatar } from 'src/common/helpers/files/validateAvatar';
import { plainToInstance } from 'class-transformer';
import { ChatMapper } from 'src/data/mappers/chat.mapper';
import { type MultipartFile } from '@fastify/multipart';
import { ChatDto, PrivateUserDto, PublicUserDto } from '@repo/utils/response';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly chatMapper: ChatMapper,
  ) {}

  async findAll(): Promise<PublicUserDto[]> {
    const users = await this.userRepository.findAll();
    return plainToInstance(PublicUserDto, users, {
      excludeExtraneousValues: true,
    });
  }

  async findMe(userId: number): Promise<PrivateUserDto> {
    const userRecord = await this.userRepository.findById(userId);
    if (!userRecord) throw new NotFoundException('User not found');
    return plainToInstance(PrivateUserDto, userRecord);
  }

  async findById(id: number): Promise<PublicUserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return plainToInstance(PublicUserDto, user);
  }

  async uploadAvatar(id: number, file: MultipartFile): Promise<PrivateUserDto> {
    const { mimetype } = file;
    const buffer = await file.toBuffer();
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const isValid = await validateAvatar(buffer);
    if (!isValid) throw new BadRequestException('Invalid media format');
    const hash = createHash('sha256').update(buffer).digest('hex');
    const url = await this.userRepository.uploadAvatar(buffer, hash, mimetype);
    const updatedUser = await this.userRepository.updateById(id, {
      avatarUrl: url,
    });
    return plainToInstance(PrivateUserDto, updatedUser);
  }

  async deleteAvatar(id: number): Promise<PrivateUserDto> {
    const user = await this.userRepository.updateById(id, { avatarUrl: null });
    return plainToInstance(PrivateUserDto, user);
  }

  async getChats(userId: number) {
    const chats = await this.userRepository.getUserChats(userId);
    const mappedChats = chats.map((chat) =>
      plainToInstance(ChatDto, chat.chat),
    );
    return mappedChats;
  }
}
