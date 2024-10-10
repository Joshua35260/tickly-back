import { ApiProperty } from '@nestjs/swagger';
import { Address, Email, Phone, Structure } from '@prisma/client';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
} from 'class-validator';
export class StructureEntity implements Structure {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty()
  name: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  @ApiProperty()
  type: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  service: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  emails: Email[];

  @IsArray()
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  phones: Phone[];

  @ApiProperty({ required: true, nullable: false })
  addressId: number;

  @ApiProperty({ required: true, nullable: false })
  address: Address;
}
