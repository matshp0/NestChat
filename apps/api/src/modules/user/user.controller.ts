import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { mimetypeFilter } from 'src/common/helpers/files/fileFilter';
import { Public } from 'src/common/decorators/public';
import { MulterFile } from 'src/common/decorators/multerFile';
import { UserId } from 'src/common/decorators/userId';
import { ChatDto } from '../chat/dto/chat.dto';
import { PrivateUserDto } from './dto/privateUser.dto';
import { PublicUserDto } from './dto/publicUser.dto';

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

  @Public()
  @Post('/')
  create(@Body() dto: CreateUserDto): Promise<PrivateUserDto> {
    return this.userService.create(dto);
  }

  @Post('/:id/avatar')
  @UseInterceptors(
    FileFastifyInterceptor('avatar', {
      fileFilter: mimetypeFilter(['image/jpeg']),
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @MulterFile() file?: Express.Multer.File,
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
