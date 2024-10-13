import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { TransformStringToNumber } from '../utils/string-to-number';

export class PaginationDto {
  @IsOptional()
  @TransformStringToNumber()
  @IsNumber()
  @ApiProperty({ required: false, default: 1 })
  page?: number = 1;

  @IsOptional()
  @TransformStringToNumber()
  @IsNumber()
  @ApiProperty({ required: false, default: 20 })
  pageSize?: number = 20;
}
