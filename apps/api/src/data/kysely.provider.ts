import { ConfigService } from '@nestjs/config';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { type DB } from './types/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KyselyService extends Kysely<DB> {
  constructor(private readonly configService: ConfigService) {
    const dialect = new PostgresDialect({
      pool: new Pool({
        connectionString: configService.get<string>('db')!,
      }),
    });
    super({ dialect, plugins: [new CamelCasePlugin()] });
  }
}
