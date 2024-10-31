import { Address, Role, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from 'src/shared/enum/role.enum';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';
import { StructureEntity } from 'src/structure/entities/structure.entity';

export class UserEntity implements User {
  @IsNumber()
  @ApiProperty({ nullable: false })
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({ nullable: false })
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @ApiProperty({ nullable: false })
  password: string;

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

  @IsEnum(RoleType, { each: true })
  @ApiProperty({ required: false, enum: RoleType, isArray: true })
  roles: Role[];

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ required: true, nullable: false })
  email: string;

  @IsString()
  @ApiProperty({ required: false, nullable: true })
  phone: string;

  @ApiProperty({ required: false, nullable: false })
  addressId: number;

  @ApiProperty({ required: false, nullable: false })
  address: Address;

  @ApiProperty({ required: false, isArray: true })
  structures: StructureEntity[];
}
