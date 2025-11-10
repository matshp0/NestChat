import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ChatDto } from 'src/modules/chat/dto/chat.dto';
import { UserChats } from '../repositories/user.repository';
import { ChatUserWithRole } from '../repositories/chat.repository';
import { ChatUserDto } from 'src/modules/chat/dto/ChatUser.dto';

@Injectable()
export class ChatMapper {
  constructor() {}

  fromUserChats(obj: UserChats): ChatDto {
    return plainToInstance(ChatDto, obj, {
      excludeExtraneousValues: true,
    });
  }

  fromChatUserWithRole(obj: ChatUserWithRole): ChatUserDto {
    const dto = plainToInstance(ChatUserDto, obj.user, {
      excludeExtraneousValues: true,
    });
    dto.role = obj.role?.name as string;
    return dto;
  }
}
