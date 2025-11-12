import { Exclude, Expose, Type } from 'class-transformer';
import { ChatUserDto } from './chatUser.dto';

export class MessageDto {
  @Expose()
  id: number;

  @Expose()
  chatId: number;

  @Expose()
  isText: boolean;

  @Expose()
  mediaUrl: string | null;

  @Expose()
  isEdited: boolean;

  @Expose()
  content: string;

  @Expose()
  updatedAt: string;

  @Expose()
  createdAt: string;

  @Expose()
  @Type(() => ChatUserDto)
  user: ChatUserDto;

  @Exclude()
  userId: string;

  @Exclude()
  passwordHash: string;
}
