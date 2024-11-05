import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMediaDto } from './create-media.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMediaDto extends PartialType(CreateMediaDto) {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID of the media entity' })
  id: number;
}
