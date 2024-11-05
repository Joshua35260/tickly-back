import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  MinLength,
  IsArray,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { RoleType } from 'src/shared/enum/role.enum';

export class CreateUserDto {
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

  @IsNotEmpty({ message: 'Address is required' })
  @ApiProperty({ nullable: false, required: false }) // Pour être optionnel pour les employee
  address: CreateAddressDto;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    nullable: false,
  })
  email: string;

  @IsString()
  @ApiProperty({
    required: false,
    nullable: true,
  })
  phone: string;

  @IsEnum(RoleType, { each: true })
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: RoleType,
    isArray: true,
    nullable: false,
  })
  roles?: RoleType[];

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  structures: number[];

  @IsOptional()
  avatarId?: number;
}
