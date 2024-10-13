import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FilterTicketDto {
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Filter by ticket id',
    type: Number,
  })
  id?: number;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Filter by ticket status',
    type: String,
  })
  status?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Filter by ticket priority',
    type: String,
  })
  priority?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Filter by ticket category',
    type: String,
  })
  category?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Filter by ticket author',
    type: String,
  })
  author?: string;
}
