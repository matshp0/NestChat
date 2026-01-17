import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHAT_PERMISSION_KEY } from 'src/common/decorators/chatPermission';
import { FastifyRequest } from 'fastify';
import { UserRepository } from 'src/data/repositories/user.repository';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      CHAT_PERMISSION_KEY,
      context.getHandler(),
    );
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const userId = request.user.id;
    const params = request.params as { chatId: string };
    const chatId = Number(params.chatId);

    const permissions = await this.userRepository.getChatPermissions(
      chatId,
      userId,
    );
    if (!permissions.some(({ name }) => name === requiredPermission))
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);

    return true;
  }
}
