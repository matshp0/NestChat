import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { S3Service } from '../s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { KyselyService } from '../kysely.provider';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { Insertable, SelectQueryBuilder, Updateable } from 'kysely';
import { DB, Media, Message } from '../types/types';

interface MessageSelectParams {
  omitUser?: boolean;
  omitReactions?: boolean;
}

@Injectable()
export class MessageRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly kyselyService: KyselyService,
    private readonly s3Service: S3Service,
  ) {}

  private getReactions<O>(qb: SelectQueryBuilder<DB, 'messages', O>) {
    return qb.select((eb) =>
      jsonArrayFrom(
        eb
          .selectFrom('messageReactions')
          .selectAll()
          .whereRef('messageReactions.messageId', '=', 'messages.id'),
      ).as('reactions'),
    );
  }

  private getUser<O>(qb: SelectQueryBuilder<DB, 'messages', O>) {
    return qb.select((eb) =>
      jsonObjectFrom(
        eb
          .selectFrom('users')
          .innerJoin('usersChats', 'usersChats.userId', 'users.id')
          .innerJoin('roles', 'roles.id', 'usersChats.roleId')
          .whereRef('users.id', '=', 'messages.userId')
          .whereRef('usersChats.chatId', '=', 'messages.chatId')
          .select('roles.name as role')
          .selectAll('users'),
      ).as('user'),
    );
  }

  findAll(params?: MessageSelectParams) {
    return this.kyselyService
      .selectFrom('messages')
      .selectAll('messages')
      .$if(!params?.omitUser, (qb) => this.getUser(qb))
      .$if(!params?.omitReactions, (qb) => this.getReactions(qb))
      .execute();
  }

  async createMedia(data: Insertable<Media>) {
    return this.kyselyService
      .insertInto('media')
      .values(data)
      .returningAll()
      .executeTakeFirst();
  }

  async findById(id: number, params?: MessageSelectParams) {
    return this.kyselyService
      .selectFrom('messages')
      .selectAll('messages')
      .where('messages.id', '=', id)
      .$if(!params?.omitUser, (qb) => this.getUser(qb))
      .$if(!params?.omitReactions, (qb) => this.getReactions(qb))
      .executeTakeFirst();
  }

  async updateById(
    id: number,
    data: Updateable<Message>,
    params?: MessageSelectParams,
  ) {
    return this.kyselyService
      .with('messages', (db) =>
        db
          .updateTable('messages')
          .set(data)
          .returningAll()
          .where('messages.id', '=', id),
      )
      .selectFrom('messages')
      .selectAll()
      .$if(!params?.omitUser, (qb) => this.getUser(qb))
      .$if(!params?.omitReactions, (qb) => this.getReactions(qb))
      .executeTakeFirst();
  }

  async getPaginatedMessages(
    chatId: number,
    n: number,
    timestamp?: Date,
    params?: MessageSelectParams,
  ) {
    return this.kyselyService
      .selectFrom('messages')
      .selectAll('messages')
      .where('chatId', '=', chatId)
      .$if(!!timestamp, (qb) => qb.where('createdAt', '<', timestamp!))
      .$if(!params?.omitUser, (qb) => this.getUser(qb))
      .$if(!params?.omitReactions, (qb) => this.getReactions(qb))
      .orderBy('createdAt', 'desc')
      .limit(n)
      .execute();
  }

  async create(data: Insertable<Message>, params?: MessageSelectParams) {
    return this.kyselyService
      .with('messages', (db) =>
        db.insertInto('messages').values(data).returningAll(),
      )
      .selectFrom('messages')
      .selectAll()
      .$if(!params?.omitUser, (qb) => this.getUser(qb))
      .$if(!params?.omitReactions, (qb) => this.getReactions(qb))
      .executeTakeFirst();
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
    return this.kyselyService
      .deleteFrom('messages')
      .where('id', '=', id)
      .executeTakeFirst();
  }

  getPreSignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.s3Service.mediaBucket,
      Key: key,
    });
    return getSignedUrl(this.s3Service, command, { expiresIn: 3600 });
  }
}
