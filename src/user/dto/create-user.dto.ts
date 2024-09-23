import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EmailDto } from 'src/shared/dto/email.dto';
import { PhoneDto } from 'src/shared/dto/phone.dto';

export class CreateUserDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty()
  lastname: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty()
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @ApiProperty()
  password: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [PhoneDto],
    required: false,
    nullable: true,
  })
  phones: PhoneDto[];

  @IsArray()
  @IsOptional()
  @IsEmail()
  @ApiProperty({
    type: [EmailDto],
    required: false,
    nullable: true,
  })
  emails: EmailDto[];
}
