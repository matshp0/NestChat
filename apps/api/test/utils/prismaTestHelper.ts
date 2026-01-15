import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated';

const connectionString = process.env.DATABASE_URL!;
if (!connectionString)
  throw new Error('Env variable DATABASE_URL is not defined');
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const resetDatabase = async () => {
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.chat.deleteMany(),
    prisma.user.deleteMany(),
    prisma.media.deleteMany(),
    prisma.messageReaction.deleteMany(),
    prisma.role.deleteMany(),
    prisma.userChat.deleteMany(),
  ]);
};

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
