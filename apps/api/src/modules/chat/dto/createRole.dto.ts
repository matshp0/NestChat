import { IsAlpha, IsArray, IsEnum, IsString, Length } from 'class-validator';
import { CHAT_PERMISSIONS } from 'src/common/enums/persmissions.enum';

export class CreateRoleDto {
  @IsArray()
  @IsEnum(CHAT_PERMISSIONS, { each: true })
  permissions: CHAT_PERMISSIONS[];

  @IsString()
  @Length(5, 50)
  name: string;
}
