import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '@prisma/client';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CategoryEntity {
  @IsNumber()
  @ApiProperty({ nullable: false })
  id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ nullable: false })
  category: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  ticket: Ticket[];
}
