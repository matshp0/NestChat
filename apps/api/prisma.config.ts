import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  migrations: {
    seed: 'ts-node ./prisma/seed/main.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
