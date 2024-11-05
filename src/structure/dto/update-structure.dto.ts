import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStructureDto } from './create-structure.dto';
import { IsOptional } from 'class-validator';

export class UpdateStructureDto extends PartialType(CreateStructureDto) {
  @ApiProperty({ required: false, type: () => Date, nullable: true })
  @IsOptional()
  archivedAt?: Date | null;
}
