import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'prisma/generated';
import { PrismaService } from '../prisma';
import { S3Service } from '../s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export type UserChats = Prisma.UserChatGetPayload<{
  select: {
    chat: true;
  };
}>;

@Injectable()
export class UserRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findById(id: number) {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findIfExists(email: string, username: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async findByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async updateById(id: number, data: Prisma.UserUpdateInput) {
    try {
      return await this.prismaService.user.update({
        where: {
          id,
        },
        data,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw err;
    }
  }

  async create(params: Prisma.UserCreateInput) {
    try {
      return await this.prismaService.user.create({ data: params });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const repeatedField = err.meta?.target as string[];
        throw new BadRequestException(
          `User with this ${repeatedField.toString()} already exists`,
        );
      }
      throw err;
    }
  }

  async uploadAvatar(avatar: Buffer, key: string, mimetype: string) {
    const command = new PutObjectCommand({
      Bucket: this.s3Service.avatarBucket,
      Key: key,
      Body: avatar,
      ContentType: mimetype,
    });
    await this.s3Service.send(command);
    return `https://${this.s3Service.avatarBucket}.s3.${this.s3Service.region}.amazonaws.com/${key}`;
  }

  async getChatPermissions(chatId: number, userId: number) {
    return await this.prismaService.userChat.findUnique({
      where: {
        userId_chatId: {
          chatId,
          userId,
        },
      },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
  }

  async getUserChats(userId: number) {
    return await this.prismaService.userChat.findMany({
      where: {
        userId,
      },
      select: {
        chat: true,
      },
    });
  }
}
