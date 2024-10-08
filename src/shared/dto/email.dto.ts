import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class EmailDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  id?: number;

  @IsEmail()
  @MaxLength(100)
  @ApiProperty()
  email: string;

  @IsString()
  @MaxLength(50)
  @ApiProperty()
  type: string;
}
