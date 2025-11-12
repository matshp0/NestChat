import { IsEnum } from 'class-validator';
import { CHAT_PERMISSIONS } from '../db';

export class ChangeUserPermissionDto {
  @IsEnum(CHAT_PERMISSIONS)
  permissions: CHAT_PERMISSIONS[];
}
