import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Prisma, Ticket } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../src/shared/dto/pagination.dto';
import { AuthenticatedRequest } from '../../src/auth/auth.service';
import { AuditLogService } from '../auditlog/auditlog.service';
import { FilterTicketDto } from './dto/filter-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}
  async create(
    createTicketDto: CreateTicketDto,
    request: AuthenticatedRequest,
  ): Promise<Ticket> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Transaction pour créer le ticket et l'audit
    return await this.prisma.$transaction(async (prisma) => {
      const newTicket = await prisma.ticket.create({
        data: {
          description: createTicketDto.description,
          priority: {
            connect: { id: createTicketDto.priority.id },
          },
          status: {
            connect: { id: createTicketDto.status.id },
          },
          category: {
            connect: createTicketDto.category.map((category) => ({
              id: category.id,
            })),
          },
          author: {
            connect: { id: user.id },
          },
        },
        include: {
          category: true,
          priority: true,
          status: true,
          author: {
            omit: { password: true },
          },
        },
      });

      // Log de l'audit pour la création du ticket
      // Étant donné qu'il s'agit d'une création, on peut ignorer les champs modifiés
      await this.auditLogService.createAuditLog(
        user.id, // Utilisateur actuel
        newTicket.id, // ID du ticket
        'Ticket', // Table liée
        'CREATE', // Action de création
        [], // Aucun champ modifié pour une création
      );

      return newTicket;
    });
  }

  async update(
    id: number,
    updateTicketDto: UpdateTicketDto,
    request: AuthenticatedRequest,
  ): Promise<Ticket> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return await this.prisma.$transaction(async (prisma) => {
      const existingTicket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          category: true, // Inclut les catégories existantes
          priority: true,
          status: true,
        },
      });

      if (!existingTicket) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }

      // Préparer les données pour la mise à jour
      const updateData: any = {
        description: updateTicketDto.description,
      };

      if (updateTicketDto.priority?.id) {
        updateData.priority = {
          connect: { id: updateTicketDto.priority.id },
        };
      }

      if (updateTicketDto.status?.id) {
        updateData.status = {
          connect: { id: updateTicketDto.status.id },
        };
      }

      if (updateTicketDto.category) {
        updateData.category = {
          set: updateTicketDto.category.map((category) => ({
            id: category.id, // Connexion avec les catégories
          })),
        };
      }

      // Mettre à jour le ticket
      const updatedTicket = await prisma.ticket.update({
        where: { id },
        data: updateData,
        include: {
          category: true, // Inclure les catégories mises à jour
          priority: true,
          status: true,
          author: {
            omit: { password: true },
          },
        },
      });

      // Comparer les champs modifiés
      const modifiedFields = (
        Object.keys(updateTicketDto) as (keyof UpdateTicketDto)[]
      )
        .filter((key) => {
          const oldValue = existingTicket[key];
          const newValue = updateTicketDto[key];
          return oldValue !== newValue; // Comparer les anciennes et nouvelles valeurs
        })
        .map((key) => ({
          field: key as string,
          previousValue: existingTicket[key]?.toString() || '',
          newValue: updateTicketDto[key]?.toString() || '',
        }));

      // Enregistrer les logs d'audit
      await this.auditLogService.createAuditLog(
        user.id,
        updatedTicket.id,
        'Ticket',
        'UPDATE',
        modifiedFields,
      );

      return updatedTicket;
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: FilterTicketDto, // Ajouter les filtres ici
  ): Promise<{
    page: number;
    pageSize: number;
    total: number;
    items: Ticket[];
  }> {
    const { page, pageSize } = pagination;

    // Construire directement le "where" Prisma à partir des filtres venant des query params
    const where: Prisma.TicketWhereInput = {
      id: filters?.id ? Number(filters.id) : undefined,
      status: filters?.status
        ? { status: { equals: filters.status, mode: 'insensitive' } } // On utilise `status.status` pour le comparer à une chaîne
        : undefined,
      priority: filters?.priority
        ? { priority: { equals: filters.priority, mode: 'insensitive' } } // On utilise `priority.priority` pour comparer à une chaîne
        : undefined,
      category: filters?.category
        ? {
            some: {
              category: { equals: filters.category, mode: 'insensitive' }, // Compare directement la chaîne
            },
          }
        : undefined,
      author: filters?.author
        ? {
            OR: [
              { firstname: { equals: filters.author, mode: 'insensitive' } },
              { lastname: { equals: filters.author, mode: 'insensitive' } },
            ],
          }
        : undefined,
    };

    // Récupération des tickets avec pagination
    const [tickets, totalCount] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: true,
          priority: true,
          status: true,
          author: {
            omit: { password: true },
            include: {
              address: true,
              structures: {
                include: {
                  address: true, // Inclure l'adresse de chaque structure
                },
              },
            },
          },
        },
      }),
      this.prisma.ticket.count({
        where,
      }),
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
        author: {
          omit: { password: true },
          include: {
            address: true,
            structures: {
              include: {
                address: true,
              },
            },
          },
        },
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
