import { ApiProperty } from '@nestjs/swagger';
import { Status, Priority, Category } from '@prisma/client';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class TicketEntity {
  @IsNumber()
  @ApiProperty({ nullable: false })
  id: number;

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

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ nullable: false })
  status: Status;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ nullable: false })
  priority: Priority;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ nullable: false })
  category: Category[];
}
