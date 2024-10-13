import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsNumber, IsString } from 'class-validator';

export class FilterStructureDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    required: false,
    description: 'Filter by structure id',
    type: Number,
  })
  id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by structure name',
    type: String,
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by structure type',
    type: String,
  })
  type?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by structure service',
    type: String,
  })
  service?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by structure emails',
    type: String,
  })
  emails?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by structure phones',
    type: String,
  })
  phones?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    required: false,
    description: 'Filter by structure users',
    type: String,
  })
  users?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by structure address',
    type: String,
  })
  address?: string;
}
