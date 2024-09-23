import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class PhoneDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  id?: number;

  @IsString()
  @MaxLength(20)
  @ApiProperty()
  phone: string;

  @IsString()
  @MaxLength(50)
  @ApiProperty()
  type: string;
}
