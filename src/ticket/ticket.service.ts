import {
  ConflictException,
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
          priority: createTicketDto.priority,
          status: createTicketDto.status,
          category: createTicketDto.category,
          author: {
            connect: { id: user.id },
          },
        },
        include: {
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
      });

      if (!existingTicket) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }

      // Préparer les données pour la mise à jour
      const updateData: any = {
        description: updateTicketDto.description,
        title: updateTicketDto.title,
        priority: updateTicketDto.priority,
        status: updateTicketDto.status,
        category: updateTicketDto.category,
      };

      // Mettre à jour le ticket
      const updatedTicket = await prisma.ticket.update({
        where: { id },
        data: updateData,
        include: {
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
      status: filters?.status // Utiliser directement le champ status comme chaîne
        ? { equals: filters.status, mode: 'insensitive' }
        : undefined,
      priority: filters?.priority // Utiliser directement le champ priority comme chaîne
        ? { equals: filters.priority, mode: 'insensitive' }
        : undefined,
      category:
        filters?.category && filters.category.length > 0
          ? {
              has: filters.category, // `hasSome` pour vérifier si le tableau contient un des éléments
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
        assignedUsers: {
          // Ajoutez cette ligne pour inclure les utilisateurs assignés
          include: {
            address: true, // Inclure d'autres relations si nécessaire, par exemple, l'adresse
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async addUserToTicket(
    ticketId: number,
    userId: number,
    request: AuthenticatedRequest,
  ): Promise<Ticket> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Commencez une transaction pour l'ajout de l'utilisateur
    return await this.prisma.$transaction(async (prisma) => {
      const existingTicket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { assignedUsers: true }, // Inclure les utilisateurs assignés pour vérifier l'existence
      });

      if (!existingTicket) {
        throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
      }

      // Assurez-vous que l'utilisateur n'est pas déjà assigné
      if (existingTicket.assignedUsers.some((user) => user.id === userId)) {
        throw new ConflictException('User is already assigned to this ticket');
      }

      // Mettre à jour le ticket pour ajouter l'utilisateur
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          assignedUsers: {
            connect: { id: userId }, // Connectez l'utilisateur par ID
          },
        },
        include: {
          assignedUsers: true, // Inclure les utilisateurs assignés dans la réponse
        },
      });

      // Enregistrer l'audit pour l'ajout d'un utilisateur
      await this.auditLogService.createAuditLog(
        user.id, // Utilisateur actuel
        updatedTicket.id, // ID du ticket
        'Ticket',
        'ASSIGN_USER', // Action d'assignation
        [{ field: 'assignedUsers', newValue: userId.toString() }], // Champ modifié
      );

      return updatedTicket;
    });
  }

  async removeUserFromTicket(
    ticketId: number,
    userId: number,
    request: AuthenticatedRequest,
  ): Promise<Ticket> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return await this.prisma.$transaction(async (prisma) => {
      const existingTicket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { assignedUsers: true }, // Inclure les utilisateurs assignés pour vérifier l'existence
      });

      if (!existingTicket) {
        throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
      }

      // Vérifiez si l'utilisateur est effectivement assigné au ticket
      const isAssigned = existingTicket.assignedUsers.some(
        (assignedUser) => assignedUser.id === userId,
      );

      // Désassigner l'utilisateur si effectivement assigné
      if (isAssigned) {
        const updatedTicket = await prisma.ticket.update({
          where: { id: ticketId },
          data: {
            assignedUsers: {
              disconnect: { id: userId }, // Deconnectez l'utilisateur par ID
            },
          },
          include: {
            assignedUsers: true, // Inclure les utilisateurs assignés dans la réponse
          },
        });

        // Enregistrez l'audit pour la désassignation
        await this.auditLogService.createAuditLog(
          user.id, // Utilisateur actuel
          updatedTicket.id, // ID du ticket
          'Ticket',
          'UNASSIGN_USER', // Action de désassignation
          [{ field: 'assignedUsers', newValue: userId.toString() }], // Champ modifié
        );

        return updatedTicket;
      } else {
        // Si l'utilisateur n'est pas assigné, retourner le ticket sans changement
        return existingTicket;
      }
    });
  }

  async remove(id: number): Promise<Ticket | null> {
    return this.prisma.ticket.delete({ where: { id } });
  }
}
