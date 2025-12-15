import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'prisma/generated';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('db');
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
}
