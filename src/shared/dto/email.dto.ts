import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class EmailDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
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
