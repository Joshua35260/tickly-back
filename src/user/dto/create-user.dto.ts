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
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

import { EmailDto } from 'src/shared/dto/email.dto';
import { PhoneDto } from 'src/shared/dto/phone.dto';
import { JobType } from 'src/shared/enum/job-type.enum';
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

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [PhoneDto],
    required: false,
    nullable: true,
  })
  phones: PhoneDto[];

  @IsNotEmpty({ message: 'Address is required' })
  @ApiProperty({ nullable: false, required: false }) // Pour être optionnel pour les employee
  address: CreateAddressDto;

  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  @ApiProperty({
    type: [EmailDto],
    required: false,
    nullable: true,
  })
  emails: EmailDto[];

  @IsEnum(RoleType, { each: true })
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: RoleType,
    isArray: true,
    nullable: false,
  })
  roles?: RoleType[];

  @IsEnum(JobType)
  @IsNotEmpty()
  @ApiProperty({ required: true, enum: JobType })
  jobType: JobType;

  @ApiProperty({
    required: true,
    type: [Number],
    nullable: false,
  })
  @ValidateIf((o) => o.jobType !== JobType.FREELANCE)
  @IsArray()
  @IsNotEmpty({
    message: 'At least one structure ID is required for non-freelancers.',
  })
  @IsNumber({}, { each: true })
  structures: number[];
}
