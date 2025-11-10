import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MapperModule } from 'src/data/mappers/mapper.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [DataModule, MapperModule],
})
export class ChatModule {}
