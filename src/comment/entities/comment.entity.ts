import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';

export class CommentEntity {
  @IsNumber()
  @ApiProperty({ description: 'Unique ID of the comment' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @ApiProperty({ description: 'Content of the comment, up to 2000 characters' })
  content: string;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({ description: 'Date the comment was created' })
  createdAt: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty({
    description: 'Date the comment was read, or null if not read',
  })
  readAt?: Date;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the ticket that this comment is associated with',
  })
  ticketId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID of the comment author' })
  authorId: number;

  @IsOptional()
  @ApiProperty({
    description: 'Details of the comment author, an object of type UserEntity',
  })
  author?: UserEntity;
}
