import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'prisma/generated';
import { PrismaService } from '../prisma';
import { S3Service } from '../s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';

export type MessageWithUser = Prisma.MessageGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        username: true;
        displayName: true;
        avatarUrl: true;
        userChat: {
          select: {
            role: {
              select: { name: true };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class MessageRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async findAll() {
    return await this.prismaService.message.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async createMedia(data: Prisma.MediaCreateInput) {
    return await this.prismaService.media.create({
      data,
    });
  }

  async findById(id: number) {
    return await this.prismaService.message.findUnique({
      where: {
        id,
      },
    });
  }

  async findByChatId(chatId: number) {
    return await this.prismaService.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          include: {
            userChat: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async updateById(id: number, data: Prisma.MessageUpdateInput) {
    try {
      return await this.prismaService.message.update({
        where: {
          id,
        },
        data,
        include: {
          user: {
            include: {
              userChat: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
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

  async getPaginatedMessages(chatId: number, n: number, timestamp?: Date) {
    const condition = timestamp
      ? [{ createdAt: { lt: timestamp } }]
      : undefined;

    return await this.prismaService.message.findMany({
      where: {
        chatId,
        OR: condition,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,

            userChat: {
              where: { chatId: chatId },
              take: 1,
              select: {
                role: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: n,
    });
  }

  async create(params: Prisma.MessageUncheckedCreateInput) {
    try {
      return await this.prismaService.message.create({
        data: params,
        include: {
          user: {
            include: {
              userChat: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });
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

  async uploadMedia(
    file: Readable,
    key: string,
    mimetype: string,
  ): Promise<void> {
    const upload = new Upload({
      client: this.s3Service,
      params: {
        Bucket: this.s3Service.mediaBucket,
        Key: key,
        Body: file,
        ContentType: mimetype,
      },
      queueSize: 4,
    });
    await upload.done();
  }

  async deleteById(id: number) {
    const message = await this.prismaService.message.delete({
      where: {
        id,
      },
      include: {
        user: {
          include: {
            userChat: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });
    return message;
  }

  getPreSignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.s3Service.mediaBucket,
      Key: key,
    });
    return getSignedUrl(this.s3Service, command, { expiresIn: 3600 });
  }
}
