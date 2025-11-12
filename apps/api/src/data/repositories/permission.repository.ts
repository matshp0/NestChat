import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CHAT_PERMISSIONS } from '@repo/utils/db';

const isChatPermission = (value: string): value is CHAT_PERMISSIONS => {
  return Object.values(CHAT_PERMISSIONS).includes(value as CHAT_PERMISSIONS);
};

@Injectable()
export class PermissionRepository {
  private permissionIds: Record<CHAT_PERMISSIONS, number>;
  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    await this.resolve();
  }

  private async resolve() {
    const permissions = await this.prismaService.permission.findMany();
    this.permissionIds = permissions.reduce(
      (acc, { name, id }) => {
        if (!isChatPermission(name)) {
          throw new Error(`Mismatch in permission: ${name}`);
        }
        acc[name] = id;
        return acc;
      },
      {} as Record<CHAT_PERMISSIONS, number>,
    );
    const dbPermissions = Object.keys(CHAT_PERMISSIONS);
    const codePermissions = Object.keys(this.permissionIds);
    if (codePermissions.length !== dbPermissions.length)
      throw new Error('Permission mismatch');
  }

  getId(permission: CHAT_PERMISSIONS): number {
    return this.permissionIds[permission];
  }
}
