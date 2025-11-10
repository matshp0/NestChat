import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { DataModule } from 'src/data/data.module';

@Module({
  providers: [MessageService],
  controllers: [MessageController],
  imports: [DataModule],
})
export class MessageModule {}
