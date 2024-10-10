import { ApiProperty } from '@nestjs/swagger';
import { Address } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
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

  @ApiProperty({ nullable: false })
  address: Address;

  @IsArray()
  @IsOptional()
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

  @IsEnum(JobType, { each: true })
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: JobType,
    nullable: false,
  })
  jobType: JobType;
}
