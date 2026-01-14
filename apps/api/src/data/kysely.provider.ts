import { type ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { type DB } from './types/types';

export class KyselyService extends Kysely<DB> {
  constructor(private readonly configService: ConfigService) {
    const dialect = new PostgresDialect({
      pool: new Pool({
        database: configService.get<string>('db')!,
      }),
    });
    super({ dialect });
  }
}
