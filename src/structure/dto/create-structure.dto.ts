import { ApiProperty } from '@nestjs/swagger';
import { Address } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  IsNumber,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
export class CreateStructureDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, nullable: false })
  id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty()
  name: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  type?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  service?: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    nullable: false,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: false,
    nullable: true,
  })
  phone: string;

  @ValidateNested() // Valider les objets imbriqués
  @Type(() => CreateAddressDto) // Type pour transformer les objets JSON en CreateAddressDto
  address: CreateAddressDto;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [CreateUserDto],
    required: false,
    nullable: true,
  })
  users: CreateUserDto[];
}
