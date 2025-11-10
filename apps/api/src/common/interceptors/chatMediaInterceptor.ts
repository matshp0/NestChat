// chat-media.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { MessageRepository } from 'src/data/repositories/message.repository';

@Injectable()
export class ChatMediaInterceptor implements NestInterceptor {
  private fileInterceptor: NestInterceptor;

  constructor(private readonly messageRepository: MessageRepository) {
    const getIntreceptor = FileFastifyInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 100,
        files: 1,
      },
      storage: this.messageRepository.getStorage(),
    });
    this.fileInterceptor = new getIntreceptor();
  }
  intercept(context: ExecutionContext, next: CallHandler) {
    return this.fileInterceptor.intercept(context, next);
  }
}
