import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { CommentEntity } from './entities/comment.entity';

@Controller('comment')
@ApiTags('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CommentEntity })
  async create(
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    return await this.commentService.create(createCommentDto);
  }

  @Get()
  @ApiOkResponse({ type: [CommentEntity] }) // Assuming you will return an array of comments
  async findAll(): Promise<CommentEntity[]> {
    return await this.commentService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: CommentEntity })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CommentEntity> {
    return await this.commentService.findOne(id);
  }

  @Get('ticket/:ticketId')
  @ApiOkResponse({ type: [CommentEntity] })
  async findAllByTicketId(
    @Param('ticketId', ParseIntPipe) ticketId: number,
  ): Promise<CommentEntity[]> {
    return await this.commentService.findAllByTicketId(ticketId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CommentEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    return await this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Comment deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<CommentEntity> {
    return await this.commentService.remove(id);
  }
}
