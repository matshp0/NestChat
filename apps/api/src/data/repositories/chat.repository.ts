import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { S3Service } from '../s3';
import { Prisma } from 'prisma/generated';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export type ChatWithRoles = Prisma.ChatGetPayload<{ include: null }>;

export type ChatUserWithRole = Prisma.UserChatGetPayload<{
  select: {
    user: true;
    role: true;
  };
}>;

@Injectable()
export class ChatRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async findById(id: number) {
    return this.prismaService.chat.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll() {
    return this.prismaService.chat.findMany({});
  }

  async create(params: Prisma.ChatCreateInput) {
    try {
      return this.prismaService.chat.create({ data: params });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const repeatedField = err.meta?.target as string[];
        throw new BadRequestException(
          `Chat with this ${repeatedField.toString()} already exists`,
        );
      }
      throw err;
    }
  }

  async updateById(id: number, data: Prisma.ChatUpdateInput) {
    try {
      return this.prismaService.chat.update({
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
        throw new NotFoundException('Chat not found');
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

  async addUser(chatId: number, userId: number, roleId: number | null) {
    try {
      return this.prismaService.userChat.create({
        data: {
          chatId,
          roleId,
          userId,
        },
        include: {
          user: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `User ${userId} is already in chat ${chatId}`,
          );
        }
      }
      throw error;
    }
  }

  async findChatUsers(chatId: number) {
    return this.prismaService.userChat.findMany({
      where: { chatId },
      select: {
        user: true,
        role: true,
      },
    });
  }
}
