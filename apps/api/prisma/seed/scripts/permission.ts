import { type PrismaClient } from '../../generated';

const permissions = [
  'message.text.create',
  'message.media.create',
  'user.add',
  'message.delete',
  'message.edit',
  'user.role.change',
  'role.edit',
  'change.avatar',
];

async function main(prisma: PrismaClient) {
  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

export default {
  name: 'Permissions seed',
  seed: main,
};
