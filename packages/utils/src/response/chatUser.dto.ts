import { Exclude, Expose } from 'class-transformer';
import { PublicUserDto } from './publicUser.dto';

export class ChatUserDto extends PublicUserDto {
  @Expose()
  role: string;
}
