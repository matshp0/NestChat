import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated';
import * as fs from 'fs';
import path from 'path';

const SCRIPT_DIRECTORY = './scripts';

export interface SeedModule {
  name: string;
  seed: (prisma: PrismaClient) => Promise<void>;
}

const initializeConnection = () => {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log('Successfully connected to database');
  return prisma;
};

const importAllModules = (dir: string) => {
  const modules: Record<string, SeedModule> = {};
  const dirPath = path.join(__dirname, dir);
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) continue;

    if (!file.endsWith('.ts')) continue;

    modules[file] = require(fullPath).default as SeedModule;
  }

  return modules;
};

const runSeeds = async (
  prisma: PrismaClient,
  modules: Record<string, SeedModule>,
) => {
  for (const seedModule in modules) {
    const { name, seed } = modules[seedModule];
    console.log(`🌱 Running ${name} from ${seedModule}`);
    try {
      await seed(prisma);
      console.log(`✅ Completed ${name}`);
    } catch (err) {
      console.error(`❌ Seed failed for ${name} from ${seedModule}:`, err);
    }
  }
};

const main = async () => {
  const prisma = initializeConnection();
  const modules = importAllModules(SCRIPT_DIRECTORY);

  await runSeeds(prisma, modules);

  await prisma.$disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
