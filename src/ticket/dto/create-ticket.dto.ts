import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateTicketDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, nullable: false })
  id?: number;

  @MaxLength(50)
  @ApiProperty({
    nullable: true,
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @ApiProperty({ nullable: false })
  description: string;

  @ApiProperty({ required: false })
  archivedAt?: Date;

  @IsOptional()
  @MaxLength(50)
  @ApiProperty({
    nullable: false,
  })
  status: string;

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

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  structureId?: number;
}
