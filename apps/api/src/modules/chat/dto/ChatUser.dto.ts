import { Exclude, Expose } from 'class-transformer';
import { PublicUserDto } from 'src/modules/user/dto/publicUser.dto';

export class ChatUserDto extends PublicUserDto {
  @Expose()
  role: string;
}
