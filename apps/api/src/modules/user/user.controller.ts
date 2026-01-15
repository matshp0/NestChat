import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserId } from 'src/common/decorators/userId';
import { UploadedFile } from 'src/common/decorators/uploadedFile';
import { MultipartInterceptor } from 'src/common/interceptors/multipart.interceptor';
import { type MultipartFile } from '@fastify/multipart';
import { ChatDto, PrivateUserDto, PublicUserDto } from '@repo/utils/response';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  findAll(): Promise<PublicUserDto[]> {
    return this.userService.findAll();
  }

  @Get('/me')
  findMe(@UserId() user: number): Promise<PrivateUserDto> {
    return this.userService.findMe(user);
  }

  @Get('/:id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<PublicUserDto> {
    return this.userService.findById(id);
  }

  @Post('/:id/avatar')
  @UseInterceptors(MultipartInterceptor({ fileSize: 2_000_000 }))
  uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: MultipartFile,
  ): Promise<PrivateUserDto> {
    return this.userService.uploadAvatar(id, file);
  }

  @Delete('/:id/avatar')
  deleteAvatar(@Param('id', ParseIntPipe) id: number): Promise<PrivateUserDto> {
    return this.userService.deleteAvatar(id);
  }

  @Get('/:userId/chats')
  getChats(@Param('userId') userId: number): Promise<ChatDto[]> {
    return this.userService.getChats(userId);
  }
}
