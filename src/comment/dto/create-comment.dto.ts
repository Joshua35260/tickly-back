import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNumber()
  @ApiProperty({ description: 'Unique ID of the comment' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @ApiProperty({ description: 'Content of the comment, up to 2000 characters' })
  content: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the ticket entity',
  })
  ticketId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID of the comment author' })
  authorId: number;
}
