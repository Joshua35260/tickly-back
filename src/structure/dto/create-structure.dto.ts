import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';
import { AddressDto } from 'src/address/dto/address.dto';
import { EmailDto } from 'src/shared/dto/email.dto';
import { PhoneDto } from 'src/shared/dto/phone.dto';

export class CreateStructureDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
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

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [EmailDto],
    required: false,
    nullable: true,
  })
  emails: EmailDto[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [PhoneDto],
    required: false,
    nullable: true,
  })
  phones: PhoneDto[];

  @ApiProperty({ nullable: false })
  address: AddressDto;
}
