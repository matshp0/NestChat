import { Module } from '@nestjs/common';
import { PrismaService } from './prisma';
import { S3Service } from './s3';
import { UserRepository } from './repositories/user.repository';
import { ChatRepository } from './repositories/chat.repository';
import { MessageRepository } from './repositories/message.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';

@Module({
  providers: [
    PrismaService,
    S3Service,
    UserRepository,
    ChatRepository,
    MessageRepository,
    PermissionRepository,
    RoleRepository,
  ],
  exports: [
    UserRepository,
    ChatRepository,
    MessageRepository,
    PermissionRepository,
    RoleRepository,
  ],
})
export class DataModule {}
