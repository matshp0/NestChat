import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Readable } from 'stream';

@Injectable()
export class NoBodyLimitMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const stream: Readable = req.raw;

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      throw new HttpException(
        'Stream processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    next();
  }
}
