import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsArray,
} from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ nullable: false })
  author: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @ApiProperty({ nullable: false })
  description: string;
  @ApiProperty({ nullable: false })
  createdAt: Date;

  @ApiProperty({ required: false })
  updatedAt: Date;

  @ApiProperty({ required: false })
  archivedAt: Date;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ nullable: false })
  statusId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ nullable: false })
  priorityId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  @ApiProperty({ nullable: false })
  categoryId: number[];
}
