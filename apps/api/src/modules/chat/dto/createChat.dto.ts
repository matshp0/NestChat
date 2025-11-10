import { IsEnum, IsString, MaxLength } from 'class-validator';
import { ChatType } from 'prisma/generated';

export class CreateChatDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(200)
  displayName: string;

  @IsEnum(ChatType)
  type: ChatType;
}
