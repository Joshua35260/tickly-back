import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class EmailDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  id?: number;

  @IsString()
  @MaxLength(100)
  @ApiProperty()
  email: string;

  @IsString()
  @MaxLength(50)
  @ApiProperty()
  type: string;
}
