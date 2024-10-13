import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class CategoryDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  category: string;
}

export class StatusDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class PriorityDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  priority: string;
}

export class CreateTicketDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, nullable: false })
  id?: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ required: true, nullable: false }) // Exemple d'objet statut
  authorId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @ApiProperty({ nullable: false })
  description: string;

  @ApiProperty({ required: false })
  archivedAt?: Date;

  @IsNotEmpty()
  @ApiProperty({ nullable: false, example: { id: 1, status: 'DOING' } }) // Exemple d'objet statut
  status: StatusDto;

  @IsNotEmpty()
  @ApiProperty({
    nullable: false,
    example: { id: 1, priority: 'LOW' }, // Exemple d'objet priorité
  })
  priority: PriorityDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  @ApiProperty({
    nullable: false,
    example: [{ id: 1, category: 'SUPPORT' }], // Exemple d'un tableau de catégories
  })
  category: CategoryDto[];
}
