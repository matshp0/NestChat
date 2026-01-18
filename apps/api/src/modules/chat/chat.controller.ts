import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UserId } from 'src/common/decorators/userId';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { MultipartInterceptor } from 'src/common/interceptors/multipart.interceptor';
import { type MultipartFile } from '@fastify/multipart';
import { UploadedFile } from 'src/common/decorators/uploadedFile';
import {
  CreateChatDto,
  PaginatedMessageQueryDto,
  CreateMessageDto,
  ChangeMessageDto,
  CreateRoleDto,
  AssignRoleDto,
} from '@repo/utils/request';
import {
  ChatDto,
  ChatUserDto,
  MessageDto,
  RoleDto,
} from '@repo/utils/response';

@UseGuards(PermissionGuard)
@Controller('/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/')
  async findAll(): Promise<ChatDto[]> {
    return this.chatService.findAll();
  }

  @Get('/:chatId')
  async findById(@Param('chatId', ParseIntPipe) id: number): Promise<ChatDto> {
    return this.chatService.findById(id);
  }

  @Post('/')
  async createChat(
    @UserId() userId: number,
    @Body() dto: CreateChatDto,
  ): Promise<ChatDto> {
    return this.chatService.createChat(userId, dto);
  }

  @Post('/:chatId/avatar')
  @UseInterceptors(MultipartInterceptor({ fileSize: 2_000_000 }))
  uploadAvatar(
    @Param('chatId', ParseIntPipe) id: number,
    @UploadedFile() file: MultipartFile,
  ): Promise<ChatDto> {
    return this.chatService.uploadAvatar(id, file);
  }

  @Get('/:chatId/messages')
  getMessageFromChat(
    @Param('chatId', ParseIntPipe) id: number,
    @Query() dto: PaginatedMessageQueryDto,
  ): Promise<MessageDto[]> {
    return this.chatService.getMessageFromChat(id, dto);
  }

  @UseInterceptors(MultipartInterceptor({ fileSize: 10_000_000 }))
  @Post('/:chatId/messages/media')
  async createMediaMessage(
    @UserId() userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
    @UploadedFile() file: MultipartFile,
  ): Promise<MessageDto> {
    return this.chatService.createMediaMessage(userId, chatId, file);
  }

  @Post('/:chatId/messages/text')
  createTextMessage(
    @UserId() userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageDto> {
    return this.chatService.createTextMessage(userId, chatId, dto);
  }

  @Patch('/:chatId/messages/:messageId')
  changeMessage(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() dto: ChangeMessageDto,
  ): Promise<MessageDto> {
    return this.chatService.changeMessage(messageId, dto);
  }

  @Delete('/:chatId/messages/:messageId')
  deleteMessage(@Param('messageId') messageId: number): Promise<MessageDto> {
    return this.chatService.deleteMessage(messageId);
  }

  @Post('/:chatId/roles')
  createRole(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() dto: CreateRoleDto,
  ): Promise<RoleDto> {
    return this.chatService.createRole(chatId, dto);
  }

  @Put('/:chatId/users/:userId/roles')
  assignRole(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AssignRoleDto,
  ): Promise<ChatUserDto> {
    return this.chatService.assignRole(chatId, userId, dto);
  }

  @Post('/:chatId/users/:userId')
  addUser(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ChatUserDto> {
    return this.chatService.addUser(chatId, userId);
  }

  @Get('/:chatId/users')
  getUsers(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<ChatUserDto[]> {
    return this.chatService.getChatUsers(chatId);
  }

  @Get('/:chatId/roles')
  getRoles(@Param('chatId', ParseIntPipe) chatId: number): Promise<RoleDto[]> {
    return this.chatService.getRoles(chatId);
  }
}
