import { IsEnum } from 'class-validator';
import { CHAT_PERMISSIONS } from 'src/common/enums/persmissions.enum';

export class ChangeUserPermissionDto {
  @IsEnum(CHAT_PERMISSIONS)
  permissions: CHAT_PERMISSIONS[];
}
