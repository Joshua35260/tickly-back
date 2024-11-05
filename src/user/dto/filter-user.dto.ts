import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class FilterUserDto {
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Search term for ticket title, status, priority, etc.',
    type: String,
  })
  search?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    required: false,
    description: 'Filter by user id',
    type: Number,
  })
  id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by user first name',
    type: String,
  })
  firstname?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by user last name',
    type: String,
  })
  lastname?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Filter by user roles',
    type: String,
  })
  roles?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by user phone',
    type: String,
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by user mail',
    type: String,
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by user address',
    type: String,
  })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by user structures',
    type: String,
  })
  structures?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Hide archived users',
    type: String,
  })
  hideArchive?: string;
}
