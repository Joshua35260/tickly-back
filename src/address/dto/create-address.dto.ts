import {
  IsOptional,
  IsString,
  MaxLength,
  IsLatitude,
  IsLongitude,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, nullable: false })
  id?: number;

  @IsString()
  @MaxLength(100)
  @ApiProperty({
    description: "Le pays de l'adresse.",
    example: 'France',
    required: true,
  })
  country: string;

  @IsString()
  @MaxLength(20)
  @ApiProperty({
    description: "Le code postal de l'adresse.",
    example: '75001',
    required: true,
  })
  postcode: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({
    description: "La ville de l'adresse.",
    example: 'Paris',
    required: true,
  })
  city: string;

  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: "La première ligne de l'adresse.",
    example: '10 Rue de la Paix',
    required: true,
  })
  streetL1: string;

  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: "La deuxième ligne de l'adresse (optionnelle).",
    example: 'Appartement 2B',
    required: false,
  })
  streetL2?: string;

  @IsLongitude()
  @IsOptional()
  @ApiProperty({
    description: "La longitude de l'adresse (optionnelle).",
    example: 2.3522,
    required: false,
  })
  longitude?: number;

  @IsLatitude()
  @IsOptional()
  @ApiProperty({
    description: "La latitude de l'adresse (optionnelle).",
    example: 48.8566,
    required: false,
  })
  latitude?: number;
}
