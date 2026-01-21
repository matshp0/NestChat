import { Injectable } from '@nestjs/common';
import { MessageRepository } from 'src/data/repositories/message.repository';
import { plainToInstance } from 'class-transformer';
import { MessageDto } from '@repo/utils/response';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async findAll() {
    const messages = await this.messageRepository.findAll({
      omitReactions: false,
      omitUser: false,
    });
    return plainToInstance(MessageDto, messages);
  }

  async findById(id: number) {
    return this.messageRepository.findById(id);
  }
}
