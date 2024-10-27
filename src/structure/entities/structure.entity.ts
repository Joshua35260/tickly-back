import { ApiProperty } from '@nestjs/swagger';
import { Address, Structure } from '@prisma/client';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEmail,
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

  @IsEmail()
  @ApiProperty({ required: true, nullable: false })
  email: string;

  @IsString()
  @ApiProperty({ required: false, nullable: true })
  phone: string;

  @ApiProperty({ required: true, nullable: false })
  addressId: number;

  @ApiProperty({ required: true, nullable: false })
  address: Address;
}
