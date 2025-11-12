import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginatedMessageQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timestamp?: Date;
}
