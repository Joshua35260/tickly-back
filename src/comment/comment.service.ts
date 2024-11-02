import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Comment } from '@prisma/client'; // Adjust import based on your project structure

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new comment
  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { content, ticketId, authorId } = createCommentDto;

    return await this.prisma.comment.create({
      data: {
        content,
        ticketId,
        authorId,
      },
    });
  }

  // Retrieve all comments
  async findAll(): Promise<Comment[]> {
    return await this.prisma.comment.findMany({
      include: {
        author: true, // Include author details if necessary
      },
    });
  }

  async findAllByTicketId(ticketId: number): Promise<Comment[]> {
    return await this.prisma.comment.findMany({
      where: { ticketId },
      include: {
        author: true, // Include author details if necessary
      },
    });
  }
  // Retrieve a specific comment by ID
  async findOne(id: number): Promise<Comment | null> {
    return await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: true, // Include author details if necessary
      },
    });
  }

  // Update an existing comment
  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const { content } = updateCommentDto;

    return await this.prisma.comment.update({
      where: { id },
      data: {
        content,
      },
    });
  }

  // Remove a comment by ID
  async remove(id: number): Promise<Comment> {
    return await this.prisma.comment.delete({
      where: { id },
    });
  }
}
