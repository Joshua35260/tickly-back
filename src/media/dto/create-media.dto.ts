import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'Name of the uploaded file',
  })
  filename: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: 'Mime type of the uploaded file',
  })
  mimetype: string;

  @IsOptional()
  @ApiProperty({
    description: 'Provide userId if you want to associate it with a user',
  })
  userId?: number;

  @IsOptional()
  @ApiProperty({
    description: 'Provide ticketId if you want to associate it with a ticket',
  })
  ticketId?: number;

  @IsOptional()
  @ApiProperty({
    description:
      'Provide structureId if you want to associate it with a structure',
  })
  structureId?: number;

  @IsOptional()
  @ApiProperty({
    description:
      'Provide commentId if you want to associate it with a structure',
  })
  commentId?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Url of the uploaded file',
  })
  url: string;
}
