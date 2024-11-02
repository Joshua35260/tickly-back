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
import { LinkedTable } from 'src/shared/enum/linked-table.enum';

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
        LinkedTable.TICKET, // Table liée
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
        archivedAt: updateTicketDto.archivedAt,
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
      ).map((key) => ({
        field: key as string,
        previousValue: existingTicket[key]?.toString() || '',
        newValue: updateTicketDto[key]?.toString() || '',
      }));

      // Enregistrer les logs d'audit
      await this.auditLogService.createAuditLog(
        user.id,
        updatedTicket.id,
        LinkedTable.TICKET,
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

    return await this.prisma.$transaction(async (prisma) => {
      const existingTicket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { assignedUsers: true },
      });

      if (!existingTicket) {
        throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
      }

      if (
        existingTicket.assignedUsers.some(
          (assignedUser) => assignedUser.id === userId,
        )
      ) {
        throw new ConflictException('User is already assigned to this ticket');
      }

      // Capture les utilisateurs assignés avant l'ajout
      const previousAssignedUsers = existingTicket.assignedUsers.map(
        (assignedUser) => `${assignedUser.firstname} ${assignedUser.lastname}`,
      );

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          assignedUsers: {
            connect: { id: userId },
          },
        },
        include: { assignedUsers: true },
      });

      // Récupérer les détails de l'utilisateur à ajouter
      const newUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstname: true,
          lastname: true,
        },
      });

      if (!newUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Enregistrer l'audit pour l'ajout d'un utilisateur
      await this.auditLogService.createAuditLog(
        user.id,
        updatedTicket.id,
        LinkedTable.TICKET,
        'ASSIGN_USER',
        [
          {
            field: 'assignedUsers',
            previousValue: previousAssignedUsers.join(', '), // Liste des utilisateurs assignés précédents
            newValue: `${newUser.firstname} ${newUser.lastname}`, // Nouveau utilisateur ajouté
          },
        ],
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
        include: { assignedUsers: true },
      });

      if (!existingTicket) {
        throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
      }

      const isAssigned = existingTicket.assignedUsers.some(
        (assignedUser) => assignedUser.id === userId,
      );

      if (isAssigned) {
        // Capture les utilisateurs assignés avant la désassignation
        const previousAssignedUsers = existingTicket.assignedUsers.map(
          (assignedUser) =>
            `${assignedUser.firstname} ${assignedUser.lastname}`,
        );

        const updatedTicket = await prisma.ticket.update({
          where: { id: ticketId },
          data: {
            assignedUsers: {
              disconnect: { id: userId },
            },
          },
          include: { assignedUsers: true },
        });

        // Récupérer les détails de l'utilisateur à désassigner
        const removedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            firstname: true,
            lastname: true,
          },
        });

        if (!removedUser) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Enregistrer l'audit pour la désassignation
        const updatedAssignedUsers = updatedTicket.assignedUsers.map(
          (assignedUser) =>
            `${assignedUser.firstname} ${assignedUser.lastname}`,
        );

        await this.auditLogService.createAuditLog(
          user.id,
          updatedTicket.id,
          LinkedTable.TICKET,
          'UNASSIGN_USER',
          [
            {
              field: 'assignedUsers',
              previousValue: previousAssignedUsers.join(', '), // Liste des utilisateurs assignés précédents
              newValue:
                updatedAssignedUsers.length > 0
                  ? updatedAssignedUsers.join(', ')
                  : 'null', // Afficher 'null' si aucune valeur
            },
          ],
        );

        return updatedTicket;
      } else {
        return existingTicket;
      }
    });
  }

  async remove(id: number): Promise<Ticket | null> {
    return this.prisma.ticket.delete({ where: { id } });
  }
}
