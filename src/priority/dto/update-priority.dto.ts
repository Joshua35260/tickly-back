import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { CreatePriorityDto } from './create-priority.dto';

export class UpdatePriorityDto extends PartialType(CreatePriorityDto) {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  id: number;
}
