import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DataModule } from 'src/data/data.module';
import { AuthModule } from '../auth/auth.module';
import { MapperModule } from 'src/data/mappers/mapper.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [DataModule, AuthModule, MapperModule],
})
export class UserModule {
  constructor() {}
}
