import { Observable } from 'rxjs';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export class MultipartOptions {
  constructor(
    public maxFileSize?: number,
    public fileType?: string | RegExp,
  ) {}
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
      if (!req.isMultipart())
        throw new BadRequestException('Multipart data is expected');

      const parts = req.parts();
      for await (const part of parts) {
        if (part.type !== 'file') continue;
        req.streamFile = part;
        break;
      }

      if (!req.streamFile) throw new BadRequestException('File is expected');

      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
}
