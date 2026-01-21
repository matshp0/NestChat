import { Module } from '@nestjs/common';
import { DataModule } from '../data.module';
import { ChatMapper } from './chat.mapper';
import { RoleMapper } from './role.mapper';

@Module({
  imports: [DataModule],
  providers: [ChatMapper, RoleMapper],
  exports: [ChatMapper, RoleMapper],
})
export class MapperModule {}
