import { SetMetadata } from '@nestjs/common';
import { CHAT_PERMISSIONS } from '@repo/utils/db';

export const CHAT_PERMISSION_KEY = 'chatPermission';
export const ChatPermission = (permission: CHAT_PERMISSIONS) =>
  SetMetadata(CHAT_PERMISSION_KEY, permission);
