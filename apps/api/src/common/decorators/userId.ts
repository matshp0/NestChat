import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: FastifyRequest = ctx.switchToHttp().getRequest();
    const { user } = request;
    return user.id;
  },
);
