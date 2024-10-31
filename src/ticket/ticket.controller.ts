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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiCookieAuth,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../src/auth/auth.guard';
import { PaginationDto } from '../../src/shared/dto/pagination.dto';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthenticatedRequest } from '../../src/auth/auth.service';
import { TicketEntity } from './entities/ticket.entity';
import { FilterTicketDto } from './dto/filter-ticket.dto';

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
  @ApiExtraModels(PaginationDto, FilterTicketDto) // Indiquer à Swagger d'utiliser ce DTO
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters?: FilterTicketDto,
  ) {
    return this.ticketService.findAll(pagination, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TicketEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const ticket = await this.ticketService.findOne(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TicketEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateTicketDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ticketService.update(id, updateUserDto, request);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TicketEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.remove(id);
  }

  @Post(':ticketId/assign-user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TicketEntity })
  async assignUser(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ticketService.addUserToTicket(ticketId, userId, request);
  }

  @Post(':ticketId/remove-user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TicketEntity })
  async unassignUser(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ticketService.removeUserFromTicket(ticketId, userId, request);
  }
}
