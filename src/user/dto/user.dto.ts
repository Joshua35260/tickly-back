import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  IsEmail,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

import { RoleType } from 'src/shared/enum/role.enum';

export class UserDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, nullable: false })
  id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ nullable: false })
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ nullable: false })
  lastname: string;

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

  @IsOptional()
  @ApiProperty({ nullable: false, required: false }) // Pour être optionnel pour les non-freelancers
  address: CreateAddressDto;

  @IsEnum(RoleType, { each: true })
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: RoleType,
    isArray: true,
    nullable: false,
  })
  roles?: RoleType[];
}
