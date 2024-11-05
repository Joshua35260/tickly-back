import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !!o.password)
  @MinLength(4)
  password: string;

  @ApiProperty({ required: false, type: () => Date, nullable: true })
  @IsOptional()
  archivedAt?: Date | null;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @ApiProperty({ required: false })
  firstname?: string; // Optionnel

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @ApiProperty({ required: false })
  lastname?: string; // Optionnel

  @IsString()
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({ nullable: false })
  login: string;

  @IsOptional()
  @ApiProperty({ nullable: false, required: false }) // Pour être optionnel pour les employee
  address: CreateAddressDto;

  @IsEmail()
  @IsOptional()
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
}
