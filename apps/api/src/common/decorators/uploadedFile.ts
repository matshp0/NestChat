import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';

export const UploadedFile = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const { streamFile } = request;
    return streamFile;
  },
);
