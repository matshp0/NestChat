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
import { mimetypeFilter } from 'src/common/helpers/files/fileFilter';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { ChatMediaInterceptor } from 'src/common/interceptors/chatMediaInterceptor';
import { MulterS3File } from 'src/common/types/multerS3File.type';
import { UserId } from 'src/common/decorators/userId';
import { MulterFile } from 'src/common/decorators/multerFile';
import { CreateChatDto } from './dto/createChat.dto';
import { CreateMessageDto } from './dto/createMessage.dto';
import { ChangeMessageDto } from './dto/changeMessage.dto';
import { MessageDto } from './dto/message.dto';
import { PaginatedMessageQueryDto } from './dto/paginatedMessagesQuery.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { CreateRoleDto } from './dto/createRole.dto';
import { AssignRoleDto } from './dto/assignRole.dto';
import { RoleDto } from './dto/role.dto';
import { ChatUserDto } from './dto/ChatUser.dto';
import { ChatDto } from './dto/chat.dto';

@UseGuards(PermissionGuard)
@Controller('/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/')
  async findAll(): Promise<ChatDto[]> {
    return await this.chatService.findAll();
  }

  @Get('/:chatId')
  async findById(@Param('chatId', ParseIntPipe) id: number): Promise<ChatDto> {
    return await this.chatService.findById(id);
  }

  @Post('/')
  async createChat(
    @UserId() userId: number,
    @Body() dto: CreateChatDto,
  ): Promise<ChatDto> {
    return await this.chatService.createChat(userId, dto);
  }

  @Post('/:chatId/avatar')
  @UseInterceptors(
    FileFastifyInterceptor('avatar', {
      fileFilter: mimetypeFilter(['image/jpeg']),
      limits: {
        fileSize: 1024 * 1024 * 5,
        files: 1,
      },
    }),
  )
  uploadAvatar(
    @Param('chatId', ParseIntPipe) id: number,
    @MulterFile() avatar?: Express.Multer.File,
  ): Promise<ChatDto> {
    return this.chatService.uploadAvatar(id, avatar);
  }

  @Get('/:chatId/messages')
  getMessageFromChat(
    @Param('chatId', ParseIntPipe) id: number,
    @Query() dto: PaginatedMessageQueryDto,
  ): Promise<MessageDto[]> {
    return this.chatService.getMessageFromChat(id, dto);
  }

  @Post('/:chatId/messages/media')
  @UseInterceptors(ChatMediaInterceptor)
  async createMediaMessage(
    @UserId() userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
    @MulterFile() media?: MulterS3File,
  ): Promise<MessageDto> {
    return this.chatService.createMediaMessage(userId, chatId, media);
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

  @Post('/:chatId/role')
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
