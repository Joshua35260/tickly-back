import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Prisma, Structure, Ticket, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../src/shared/dto/pagination.dto';
import { AuthenticatedRequest } from '../../src/auth/auth.service';
import { AuditLogService } from '../auditlog/auditlog.service';
import { FilterTicketDto } from './dto/filter-ticket.dto';
import { LinkedTable } from 'src/shared/enum/linked-table.enum';
interface TopTicketByUser {
  author: User;
  authorId: number;
  ticketCount: number;
}

interface TopTicketByStructure {
  structure: Structure;
  structureId: number;
  ticketCount: number;
}
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
          status: 'OPEN',
          category: createTicketDto.category,
          author: {
            connect: { id: user.id },
          },
          structure: createTicketDto.structureId
            ? { connect: { id: createTicketDto.structureId } }
            : undefined,
        },
        include: {
          author: {
            omit: { password: true },
          },
          structure: true,
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
        structure: updateTicketDto.structureId
          ? { connect: { id: updateTicketDto.structureId } }
          : undefined,
      };

      // Mettre à jour le ticket
      const updatedTicket = await prisma.ticket.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            omit: { password: true },
          },
          structure: true,
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
    filters?: FilterTicketDto,
    sort?: string,
  ): Promise<{
    page: number;
    pageSize: number;
    total: number;
    items: Ticket[];
  }> {
    const { page, pageSize } = pagination;

    // Construire le "where" Prisma à partir des filtres
    const where: Prisma.TicketWhereInput = {};

    // Si un id est fourni, ajoutez-le au where
    if (filters?.id !== undefined) {
      where.id = Number(filters.id);
    }

    // Filtrer les tickets archivés si hideArchive est vrai
    if (filters?.hideArchive === 'true') {
      where.archivedAt = { equals: null }; // Exclure les tickets archivés
    }

    // Si une recherche est fournie, ajoutez-la au where
    if (filters?.search) {
      const searchTerms = filters.search
        .split(' ')
        .filter((term) => term.trim() !== ''); // Séparer par espaces et filtrer les termes vides

      // Conditions pour le titre
      const titleConditions = searchTerms.map((term) => ({
        title: { contains: term, mode: 'insensitive' as Prisma.QueryMode },
      }));

      // Conditions pour l'auteur
      const authorConditions = searchTerms.flatMap((term) => [
        {
          author: {
            firstname: {
              contains: term,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        },
        {
          author: {
            lastname: {
              contains: term,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        },
      ]);

      // Ajoutez les conditions dans un OR
      where.OR = [
        {
          AND: titleConditions,
        },
        {
          OR: authorConditions,
        },
      ];
    }

    // Filtre par statut
    if (filters?.status) {
      where.status = {
        equals: filters.status,
        mode: 'insensitive' as Prisma.QueryMode,
      };
    }

    // Filtre par priorité
    if (filters?.priority) {
      where.priority = {
        equals: filters.priority,
        mode: 'insensitive' as Prisma.QueryMode,
      };
    }

    // Filtre par catégorie (un seul élément)
    if (filters?.category) {
      where.category = {
        has: filters.category, // Utilisez has pour vérifier la présence dans le tableau
      };
    }

    // Récupération des tickets avec pagination
    const [tickets, totalCount] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: sort ? this.getSortCriteria(sort) : undefined,
        include: {
          author: {
            omit: { password: true },
            include: {
              address: true,
              // Il n'y a pas de "structure" ici, utilisez "structures"
              structures: {
                include: {
                  address: true,
                },
              },
            },
          },
          structure: true, // Incluez la structure ici directement depuis Ticket
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total: totalCount,
      items: tickets,
    };
  }

  // Méthode pour transformer le critère de tri
  private getSortCriteria(sort: string) {
    const sortParams = sort.split(' '); // 'id asc' devient ['id', 'asc']
    if (sortParams.length !== 2) {
      throw new Error('Invalid sort parameter');
    }
    return {
      [sortParams[0]]: sortParams[1].toLowerCase() === 'asc' ? 'asc' : 'desc', // Valider les directions
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
            // Inclure toutes les structures associées à l'utilisateur
            structures: {
              include: {
                address: true, // Inclure l'adresse des structures si nécessaire
              },
            },
          },
        },
        assignedUsers: {
          include: {
            address: true, // Inclure l'adresse des utilisateurs assignés si nécessaire
          },
        },
        structure: true, // Inclure la structure associée au ticket
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

  // GET BY ENTITY
  async findByStructureId(structureId: number): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { structureId },
      include: {
        author: true,
        structure: true,
      },
    });

    if (!tickets || tickets.length === 0) {
      throw new NotFoundException(
        `No tickets found for structure ID ${structureId}`,
      );
    }
    return tickets;
  }
  async findByUserId(userId: number): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { authorId: userId }, // Assurez-vous que le champ 'authorId' correspond à votre modèle
      include: {
        author: true,
        structure: true,
      },
    });

    if (!tickets || tickets.length === 0) {
      throw new NotFoundException(`No tickets found for user ID ${userId}`);
    }
    return tickets;
  }

  // AGGREGATION DE DONNEES
  async getStats(): Promise<{
    topTicketsByUser: { author: User; _count: { id: number } }[];
    topTicketsByStructure: { structure: Structure; _count: { id: number } }[];
    averageTicketsCreated: {
      averagePerYear: number;
      averagePerMonth: number;
      averagePerWeek: number;
    };
    ticketsCountByCategory: {
      category: string; // Chaque catégorie (STRING)
      count: number; // Nombre total de tickets pour chaque catégorie
    }[];
    ticketsCountByPriority: {
      priority: string; // Chaque priorité (STRING)
      count: number; // Nombre total de tickets pour chaque priorité
    }[];
  }> {
    const topTicketsByUser = await this.getTopTicketsByUser();
    const topTicketsByStructure = await this.getTopTicketsByStructure();
    const averageTicketsCreated = await this.getAverageTicketsCreated();
    const ticketsCountByCategory = await this.getTicketsCountByCategory();
    const ticketsCountByPriority = await this.getTicketsCountByPriority();

    return {
      topTicketsByUser,
      topTicketsByStructure,
      averageTicketsCreated,
      ticketsCountByCategory, // Ajout des comptes par catégorie
      ticketsCountByPriority, // Ajout des comptes par priorité
    };
  }
  // TOP USERS BY NUMBER OF TICKETS
  private async getTopTicketsByUser(): Promise<
    { author: User; _count: { id: number } }[]
  > {
    const topTicketsByUser = await this.prisma.$queryRaw<TopTicketByUser[]>`
      SELECT t."authorId", CAST(COUNT(*) AS INT) AS "ticketCount"
      FROM "Ticket" t
      GROUP BY t."authorId"
      ORDER BY "ticketCount" DESC
      LIMIT 5;
  `;

    // Récupérer les utilisateurs correspondants pour les tickets
    const userIds = topTicketsByUser.map((ticket) => ticket.authorId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    // Mapper les résultats pour associer les utilisateurs et le nombre de tickets
    return topTicketsByUser
      .map((ticket) => {
        const user = users.find((u) => u.id === ticket.authorId);
        return user
          ? { author: user, _count: { id: ticket.ticketCount } }
          : null;
      })
      .filter(Boolean); // Filtrer les valeurs nulles
  }

  // TOP STRUCTURES BY NUMBER OF TICKETS
  private async getTopTicketsByStructure(): Promise<
    { structure: Structure; _count: { id: number } }[]
  > {
    const topTicketsByStructure = await this.prisma.$queryRaw<
      TopTicketByStructure[]
    >`
        SELECT "structureId", CAST(COUNT(*) AS INT) AS "ticketCount"
        FROM "Ticket"
        WHERE "structureId" IS NOT NULL
        GROUP BY "structureId"
        ORDER BY "ticketCount" DESC
        LIMIT 5;
    `;

    return Promise.all(
      topTicketsByStructure.map(async (ticket) => {
        const structure = await this.prisma.structure.findUnique({
          where: { id: ticket.structureId },
        });

        return structure
          ? { structure, _count: { id: Number(ticket.ticketCount) } } // Conversion en Number ici
          : null;
      }),
    ).then((results) => results.filter(Boolean)); // Filtrer les valeurs nulles
  }

  // MOYENNE DE TICKETS CRÉÉS PAR AN, MOIS ET SEMAINES
  private async getAverageTicketsCreated(): Promise<{
    averagePerYear: number;
    averagePerMonth: number;
    averagePerWeek: number;
  }> {
    // Récupérer le nombre total de tickets créés
    const totalTicketsCount = await this.prisma.ticket.count();

    // Récupérer le nombre de tickets créés dans l'année en cours
    const currentYearCount = await this.prisma.ticket.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1), // 1er janvier de l'année en cours
          lt: new Date(new Date().getFullYear() + 1, 0, 1), // 1er janvier de l'année suivante
        },
      },
    });

    // Récupérer le nombre de tickets créés dans le mois en cours
    const currentMonthCount = await this.prisma.ticket.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 1er jour du mois en cours
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // 1er jour du mois suivant
        },
      },
    });

    // Récupérer le nombre de tickets créés dans la semaine en cours
    const currentWeekCount = await this.prisma.ticket.count({
      where: {
        createdAt: {
          gte: new Date(
            new Date().setDate(new Date().getDate() - new Date().getDay()),
          ), // Début de la semaine
          lt: new Date(
            new Date().setDate(
              new Date().getDate() + (6 - new Date().getDay() + 1),
            ),
          ), // Fin de la semaine
        },
      },
    });

    // Calculer la moyenne et arrondir
    const averagePerYear =
      totalTicketsCount > 0
        ? Math.round(currentYearCount / new Date().getFullYear())
        : 0;
    const averagePerMonth =
      totalTicketsCount > 0
        ? Math.round(currentMonthCount / new Date().getDate())
        : 0;
    const averagePerWeek =
      totalTicketsCount > 0 ? Math.round(currentWeekCount / 7) : 0;

    return {
      averagePerYear,
      averagePerMonth,
      averagePerWeek,
    };
  }

  // count ticket and return a number of tickett by category, and priority
  private async getTicketsCountByCategory(): Promise<
    {
      category: string; // Chaque catégorie (STRING)
      count: number; // Nombre total de tickets pour chaque catégorie
    }[]
  > {
    // Obtenir toutes les catégories uniques
    const categories = await this.prisma.ticket.findMany({
      select: {
        category: true,
      },
    });

    // Extraire les catégories uniques
    const uniqueCategories = Array.from(
      new Set(categories.flatMap((ticket) => ticket.category)),
    );

    // Compter les tickets pour chaque catégorie
    const results: { category: string; count: number }[] = [];

    for (const category of uniqueCategories) {
      const count = await this.prisma.ticket.count({
        where: {
          category: {
            has: category, // Vérifie si la catégorie est présente dans le tableau
          },
        },
      });

      results.push({ category, count });
    }

    return results;
  }

  private async getTicketsCountByPriority(): Promise<
    {
      priority: string; // Chaque priorité (STRING)
      count: number; // Nombre total de tickets pour chaque priorité
    }[]
  > {
    // Obtenir toutes les priorités uniques
    const priorities = await this.prisma.ticket.findMany({
      select: {
        priority: true,
      },
    });

    // Extraire les priorités uniques
    const uniquePriorities = Array.from(
      new Set(priorities.map((ticket) => ticket.priority)),
    );

    // Compter les tickets pour chaque priorité
    const results: { priority: string; count: number }[] = [];

    for (const priority of uniquePriorities) {
      const count = await this.prisma.ticket.count({
        where: {
          priority: priority, // Filtre par priorité
        },
      });

      results.push({ priority, count });
    }

    return results;
  }

  // get tickets by status OPEN
  async getTicketsByStatusOpen(): Promise<{
    count: number;
    tickets: Ticket[];
  }> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        status: 'OPEN',
      },
      include: {
        author: true,
        structure: true,
      },
    });

    return {
      count: tickets.length,
      tickets: tickets,
    };
  }
}
