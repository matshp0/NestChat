import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PermissionRepository } from './permission.repository';
import { Prisma } from 'prisma/generated';
import { CHAT_PERMISSIONS } from '@repo/utils/db';

export type RolesWithPermissions = Prisma.RoleGetPayload<{
  include: { permissions: { include: { permission: true } } };
}>;

@Injectable()
export class RoleRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async createWithPermissions(
    chatId: number,
    permissions: CHAT_PERMISSIONS[],
    name: string,
  ) {
    return await this.prismaService.$transaction(async (tx) => {
      try {
        const role = await tx.role.create({
          data: {
            chatId,
            name,
          },
        });
        await tx.rolePermission.createMany({
          data: permissions.map((permission) => ({
            roleId: role.id,
            permissionId: this.permissionRepository.getId(permission),
          })),
        });
        const roles = await tx.role.findUnique({
          where: { id: role.id },
          include: { permissions: { include: { permission: true } } },
        });

        return roles!;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          const repeatedField = err.meta?.target as string[];
          throw new BadRequestException(
            `Role with this ${repeatedField.toString()} already exists`,
          );
        }
        throw err;
      }
    });
  }

  async updateUserRole(chatId: number, userId: number, roleId: number) {
    try {
      return await this.prismaService.userChat.update({
        where: {
          userId_chatId: {
            userId,
            chatId,
          },
        },
        data: {
          roleId,
        },
        include: {
          user: true,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          throw new NotFoundException(`Role with this id does not exist`);
        }
        if (err.code === 'P2025') {
          throw new NotFoundException(
            `User ${userId} is not part of chat ${chatId}`,
          );
        }
      }
      throw err;
    }
  }

  async findByName(chatId: number, name: string) {
    return await this.prismaService.role.findFirst({
      where: {
        chatId,
        name,
      },
    });
  }

  async findByChatId(chatId: number) {
    return await this.prismaService.role.findMany({
      where: {
        chatId,
      },
      include: { permissions: { include: { permission: true } } },
    });
  }
}
