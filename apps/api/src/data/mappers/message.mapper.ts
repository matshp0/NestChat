import { Injectable } from '@nestjs/common';
import {
  MessageRepository,
  MessageWithUser,
} from '../repositories/message.repository';
import { MessageDto } from 'src/modules/chat/dto/message.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MessageMapper {
  constructor(private readonly messageRepository: MessageRepository) {}

  async toMessage(obj: MessageWithUser): Promise<MessageDto>;
  async toMessage(obj: MessageWithUser[]): Promise<MessageDto[]>;

  async toMessage(
    obj: MessageWithUser | MessageWithUser[],
  ): Promise<MessageDto | MessageDto[]> {
    if (Array.isArray(obj)) {
      return Promise.all(obj.map((item) => this.mapOne(item)));
    }
    return this.mapOne(obj);
  }

  private async mapOne(entity: MessageWithUser): Promise<MessageDto> {
    const dto = plainToInstance(MessageDto, entity, {
      excludeExtraneousValues: true,
    });
    dto.user.role = entity.user.userChat[0].role!.name;
    dto.mediaUrl = entity.mediaId
      ? await this.messageRepository.getPreSignedUrl(entity.mediaId)
      : null;

    return dto;
  }
}
