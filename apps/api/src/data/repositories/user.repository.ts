import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated';
import { PrismaService } from '../prisma';
import { S3Service } from '../s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { KyselyService } from '../kysely.provider';
import { Insertable, Updateable } from 'kysely';
import { User } from '../types/types';

export type UserChats = Prisma.UserChatGetPayload<{
  select: {
    chat: true;
  };
}>;

@Injectable()
export class UserRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly kyselyService: KyselyService,
    private readonly s3Service: S3Service,
  ) {}

  async findAll() {
    return await this.kyselyService.selectFrom('users').selectAll().execute();
  }

  async findById(id: number) {
    return await this.kyselyService
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findIfExists(email: string, username: string) {
    return await this.kyselyService
      .selectFrom('users')
      .where((eb) =>
        eb.or([eb('email', '=', email), eb('username', '=', username)]),
      )
      .executeTakeFirst();
  }

  async findByEmail(email: string) {
    return await this.kyselyService
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();
  }

  async updateById(id: number, data: Updateable<User>) {
    return await this.kyselyService
      .updateTable('users')
      .set(data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async create(data: Insertable<User>) {
    return await this.kyselyService
      .insertInto('users')
      .values(data)
      .returningAll()
      .executeTakeFirst();
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
    return await this.kyselyService
      .selectFrom('usersChats')
      .innerJoin('roles', 'usersChats.roleId', 'roles.id')
      .innerJoin('rolesPermissions', 'roles.id', 'rolesPermissions.roleId')
      .innerJoin(
        'permissions',
        'rolesPermissions.permissionId',
        'permissions.id',
      )
      .where('usersChats.userId', '=', userId)
      .where('usersChats.chatId', '=', chatId)
      .selectAll('permissions')
      .execute();
  }

  async getUserChats(userId: number) {
    return await this.kyselyService
      .selectFrom('usersChats')
      .innerJoin('chats', 'usersChats.chatId', 'chats.id')
      .where('usersChats.userId', '=', userId)
      .selectAll('chats')
      .execute();
  }
}
