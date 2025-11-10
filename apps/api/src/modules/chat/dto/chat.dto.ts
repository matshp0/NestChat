import { Exclude, Expose, Type } from 'class-transformer';
import { RoleDto } from './role.dto';

export class ChatDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  displayName: string;

  @Expose()
  type: string;

  @Expose()
  avatarUrl: string | null;

  @Exclude()
  @Type(() => RoleDto)
  roles: RoleDto[];

  @Expose()
  createdAt: string;

  @Exclude()
  updatedAt: string;
}
