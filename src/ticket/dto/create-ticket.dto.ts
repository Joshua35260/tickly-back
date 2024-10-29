import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsArray,
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
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    nullable: false,
  })
  status: string;

  @IsNotEmpty()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    nullable: false,
  })
  priority: string;

  @IsArray()
  @ApiProperty({
    nullable: false,
  })
  category: string[];
}
