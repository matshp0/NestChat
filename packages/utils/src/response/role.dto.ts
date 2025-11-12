import { Exclude, Expose } from 'class-transformer';
import { CHAT_PERMISSIONS } from 'src/db';

export class RoleDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  permisions: CHAT_PERMISSIONS[];

  @Exclude()
  chatId: number;

  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;
}
