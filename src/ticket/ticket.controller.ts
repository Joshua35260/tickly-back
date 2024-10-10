import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiCookieAuth,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthenticatedRequest } from 'src/auth/auth.service';
import { TicketEntity } from './entities/ticket.entity';

@Controller('ticket')
@ApiTags('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: TicketEntity })
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return await this.ticketService.create(createTicketDto, request);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TicketEntity, isArray: true })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Number of the page',
    example: '1',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: String,
    description: 'Number of items per page',
    example: '20',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number, // Pass them to the service, With this setup, you can call the endpoint with optional query parameters like this: sql GET /user?page=2&pageSize=10
  ) {
    const pagination: PaginationDto = {
      page: page || 1, // Default to 1 if not provided
      pageSize: pageSize || 20, // Default to 20 if not provided
    };
    return this.ticketService.findAll(pagination);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TicketEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TicketEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateTicketDto,
  ) {
    return this.ticketService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TicketEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.remove(id);
  }
}
