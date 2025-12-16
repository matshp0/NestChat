import { type Observable } from 'rxjs';
import {
  BadRequestException,
  type CallHandler,
  type ExecutionContext,
  mixin,
  type NestInterceptor,
  type Type,
} from '@nestjs/common';
import { type FastifyRequest, type FastifyReply } from 'fastify';

const DEFAULT_FILE_SIZE = 1000_000;

interface MultipartOptions {
  fileSize?: number;
}

export function MultipartInterceptor(
  options: MultipartOptions = {},
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const req = context.switchToHttp().getRequest<FastifyRequest>();
      const res = context.switchToHttp().getResponse<FastifyReply>();
      if (!req.isMultipart())
        throw new BadRequestException('Multipart data is expected');

      const file = await req.file({
        throwFileSizeLimit: true,
        limits: {
          fileSize: options.fileSize ?? DEFAULT_FILE_SIZE,
        },
      });
      if (!file) {
        throw new BadRequestException('File is required');
      }
      const stream = file.file;
      stream.on('limit', () => {
        res.status(413).send({
          statusCode: 413,
          message: 'File size limit exceeded',
        });
        stream.destroy();
      });
      req.streamFile = file;
      return next.handle();
    }
  }
  return mixin(MixinInterceptor);
}
