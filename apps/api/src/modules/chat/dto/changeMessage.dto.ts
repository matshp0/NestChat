import { IsString, MaxLength } from 'class-validator';

export class ChangeMessageDto {
  @IsString()
  @MaxLength(1000)
  content: string;
}
