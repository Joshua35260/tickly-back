import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 1 })
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 20 })
  pageSize?: number = 20;
}
