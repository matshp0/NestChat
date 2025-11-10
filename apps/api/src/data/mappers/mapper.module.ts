import { Module } from '@nestjs/common';
import { DataModule } from '../data.module';
import { MessageMapper } from './message.mapper';
import { ChatMapper } from './chat.mapper';
import { RoleMapper } from './role.mapper';

@Module({
  imports: [DataModule],
  providers: [MessageMapper, ChatMapper, RoleMapper],
  exports: [MessageMapper, ChatMapper, RoleMapper],
})
export class MapperModule {}
