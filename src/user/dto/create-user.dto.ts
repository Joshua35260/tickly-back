import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EmailDto } from 'src/shared/dto/email.dto';
import { PhoneDto } from 'src/shared/dto/phone.dto';

export class CreateUserDto {
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
  @ApiProperty({ type: [PhoneDto], description: 'List of phone numbers' })
  phones: PhoneDto[];

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [EmailDto], description: 'List of emails' })
  emails: EmailDto[];
}
