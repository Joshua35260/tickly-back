import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  id?: number;

  @IsString()
  @ApiProperty({ required: true })
  country: string;

  @IsString()
  @ApiProperty({ required: true })
  postcode: string;

  @IsString()
  @ApiProperty({ required: true })
  city: string;

  @IsString()
  @ApiProperty({ required: true })
  street_l1: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  street_l2?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  latitude?: number;
}
