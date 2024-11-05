import { Role, User } from '@prisma/client';
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
import { MediaEntity } from 'src/shared/media.entity';
import { AddressEntity } from 'src/address/entities/address.entity';

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

  @ApiProperty({ required: false, type: () => AddressEntity, nullable: false })
  address: AddressEntity;

  @ApiProperty({ required: false, type: () => StructureEntity, isArray: true })
  structures?: StructureEntity[];

  @ApiProperty({ required: false, nullable: false })
  avatarId: number;

  @ApiProperty({ required: false, type: () => MediaEntity, nullable: true })
  avatar?: MediaEntity;

  @ApiProperty({ required: false, nullable: true })
  avatarUrl: string;

  @ApiProperty({ required: false })
  archivedAt: Date;
}
