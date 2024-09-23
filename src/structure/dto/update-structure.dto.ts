import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStructureDto } from './create-structure.dto';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateStructureDto extends PartialType(CreateStructureDto) {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  id: number;
}
