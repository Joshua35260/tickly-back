import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class FilterUserDto {
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
    description: 'Filter by user job type',
    type: String,
  })
  jobType?: string;

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
  phones?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filter by user mail',
    type: String,
  })
  emails?: string;

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
}
