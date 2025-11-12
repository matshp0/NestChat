import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { CHAT_PERMISSIONS } from '../db';

export class PermissionDto {
  @Expose()
  @IsEnum(CHAT_PERMISSIONS)
  permissions: CHAT_PERMISSIONS;
}
