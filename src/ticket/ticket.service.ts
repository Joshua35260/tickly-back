import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { AuthenticatedRequest } from 'src/auth/auth.service';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}
  async create(
    createTicketDto: CreateTicketDto,
    request: AuthenticatedRequest,
  ): Promise<Ticket> {
    const user = request.user; // Récupérez l'utilisateur authentifié

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const newTicket = await this.prisma.ticket.create({
      data: {
        description: createTicketDto.description,
        priorityId: createTicketDto.priorityId,
        statusId: createTicketDto.statusId,
        author: user.firstname + ' ' + user.lastname,
        // Connecter les catégories à la relation ticket
        category: {
          connect: createTicketDto.categoryId.map((id) => ({ id })), // Correction ici
        },
      },
      include: {
        category: true, // Inclure les catégories liées
        priority: true,
        status: true,
      },
    });

    return newTicket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    return await this.prisma.ticket.update({
      where: { id },
      data: {
        description: updateTicketDto.description,
        priorityId: updateTicketDto.priorityId,
        statusId: updateTicketDto.statusId,
        category: {
          connect: updateTicketDto.categoryId.map((id) => ({ id })),
        },
      },
      include: {
        category: true,
        priority: true,
        status: true,
      },
    });
  }

  async findAll({ page = 1, pageSize = 20 }: PaginationDto): Promise<{
    page: number;
    pageSize: number;
    total: number;
    items: Ticket[];
  }> {
    const [tickets, totalCount] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: true,
          priority: true,
          status: true,
        },
      }),
      this.prisma.ticket.count(),
    ]);

    return {
      page,
      pageSize,
      total: totalCount,
      items: tickets,
    };
  }

  async findOne(id: number): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        priority: true,
        status: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async remove(id: number): Promise<Ticket | null> {
    return this.prisma.ticket.delete({ where: { id } });
  }
}
