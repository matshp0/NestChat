import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/')
  async findAll() {
    return this.messageService.findAll();
  }

  @Get('/:id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.messageService.findById(id);
  }
}
