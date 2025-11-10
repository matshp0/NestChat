import { Expose } from 'class-transformer';
import { CHAT_PERMISSIONS } from 'src/common/enums/persmissions.enum';
import { IsEnum } from 'class-validator';

export class PermissionDto {
  @Expose()
  @IsEnum(CHAT_PERMISSIONS)
  permissions: CHAT_PERMISSIONS;
}
