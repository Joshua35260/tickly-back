import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class MediaEntity {
  @IsNumber()
  @ApiProperty({ nullable: false })
  id?: number;

  @IsString()
  @ApiProperty({ nullable: false })
  filename: string;

  @IsString()
  @ApiProperty({ nullable: false })
  typemime: string;
}
