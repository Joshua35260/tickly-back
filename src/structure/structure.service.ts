import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateStructureDto } from './dto/create-structure.dto';
import { UpdateStructureDto } from './dto/update-structure.dto';
import { Prisma, Structure } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { AuditLogService } from 'src/auditlog/auditlog.service';
import { AuthenticatedRequest } from 'src/auth/auth.service';
import { FilterStructureDto } from './dto/filter-structure.dto';
import { LinkedTable } from 'src/shared/enum/linked-table.enum';

@Injectable()
export class StructureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}
  async create(
    createStructureDto: CreateStructureDto,
    request: AuthenticatedRequest, // Ajouter la requête authentifiée
  ): Promise<Structure> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (!createStructureDto.address) {
      throw new BadRequestException(
        "L'adresse est obligatoire pour créer une structure.",
      );
    }
    // Transaction pour créer la structure et l'audit
    return await this.prisma.$transaction(async (prisma) => {
      const newStructure = await prisma.structure.create({
        data: {
          name: createStructureDto.name,
          type: createStructureDto.type,
          service: createStructureDto.service,
          email: createStructureDto.email,
          phone: createStructureDto.phone,
          address: {
            create: {
              country: createStructureDto.address.country,
              city: createStructureDto.address.city,
              streetL1: createStructureDto.address.streetL1,
              streetL2: createStructureDto.address.streetL2,
              postcode: createStructureDto.address.postcode,
              latitude: createStructureDto.address.latitude,
              longitude: createStructureDto.address.longitude,
            },
          },
        },
        include: {
          address: true,
          users: {
            omit: { password: true },
          },
        },
      });

      // Log de l'audit pour la création de la structure
      await this.auditLogService.createAuditLog(
        user.id, // Utilisateur actuel
        newStructure.id, // ID de la structure créée
        LinkedTable.STRUCTURE,
        'CREATE', // Action de création
        [], // Aucun champ modifié pour une création
      );

      return newStructure;
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: FilterStructureDto,
    sort?: string,
  ): Promise<{
    page: number;
    pageSize: number;
    total: number;
    items: Structure[];
  }> {
    const { page, pageSize } = pagination;

    // Construire l'objet `where` pour les filtres
    const where: Prisma.StructureWhereInput = {
      id: filters?.id ? Number(filters.id) : undefined,
      name: filters?.name
        ? { contains: filters.name, mode: 'insensitive' }
        : undefined,
      type: filters?.type
        ? { equals: filters.type, mode: 'insensitive' }
        : undefined,
      service: filters?.service
        ? { equals: filters.service, mode: 'insensitive' }
        : undefined,
      email: filters?.email
        ? { contains: filters.email, mode: 'insensitive' }
        : undefined,
      phone: filters?.phone
        ? { contains: filters.phone, mode: 'insensitive' }
        : undefined,
      users: filters?.users
        ? {
            some: {
              OR: [
                { firstname: { contains: filters.users, mode: 'insensitive' } },
                { lastname: { contains: filters.users, mode: 'insensitive' } },
              ],
            },
          }
        : undefined,
    };
    if (filters?.hideArchive === 'true') {
      where.archivedAt = { equals: null }; // Exclure les tickets archivés
    }
    // Ajouter un filtre de recherche `search` pour vérifier sur plusieurs champs
    if (filters?.search) {
      const searchTerms = filters.search
        .split(' ')
        .filter((term) => term.trim() !== '');

      // Initialiser le tableau OR pour les recherches
      where.OR = [];

      // Ajout des conditions de recherche pour chaque terme
      searchTerms.forEach((term) => {
        where.OR.push({
          name: { contains: term, mode: 'insensitive' },
        });
        where.OR.push({
          address: {
            OR: [
              { streetL1: { contains: term, mode: 'insensitive' } },
              { city: { contains: term, mode: 'insensitive' } },
              { country: { contains: term, mode: 'insensitive' } },
            ],
          },
        });
        where.OR.push({
          email: { contains: term, mode: 'insensitive' },
        });
        where.OR.push({
          phone: { contains: term, mode: 'insensitive' },
        });
      });
    }

    // Récupération des structures avec pagination et filtres
    const [structures, totalCount] = await this.prisma.$transaction([
      this.prisma.structure.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: sort ? this.getSortCriteria(sort) : undefined,
        include: {
          address: true,
          users: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              login: true,
            },
          },
        },
      }),
      this.prisma.structure.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total: totalCount,
      items: structures,
    };
  }

  private getSortCriteria(sort: string) {
    const sortParams = sort.split(' '); // 'name asc' devient ['name', 'asc']
    if (sortParams.length !== 2) {
      throw new Error('Invalid sort parameter');
    }
    return {
      [sortParams[0]]: sortParams[1].toLowerCase() === 'asc' ? 'asc' : 'desc',
    };
  }

  async findOne(id: number): Promise<Structure | null> {
    return await this.prisma.structure.findUnique({
      where: { id },
      include: {
        address: true,
        users: {
          omit: { password: true },
        },
        tickets: true,
      },
    });
  }

  async update(
    id: number,
    updateStructureDto: UpdateStructureDto,
    request: AuthenticatedRequest, // Ajouter la requête authentifiée
  ): Promise<Structure | null> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return await this.prisma.$transaction(async (prisma) => {
      // Vérifiez si la structure existe
      const existingStructure = await prisma.structure.findUnique({
        where: { id },
        include: {
          address: true,
          users: {
            omit: { password: true },
          },
          tickets: true,
        },
      });

      if (!existingStructure) {
        throw new NotFoundException(`Structure with ID ${id} not found`);
      }

      // Préparer les données pour la mise à jour
      const updateData: any = {
        ...updateStructureDto, // Inclure tous les champs de la DTO
        address: undefined, // Exclure temporairement pour traitement
      };

      // Mettre à jour l'adresse si elle est fournie
      if (updateStructureDto.address) {
        updateData.address = {
          update: {
            id: updateStructureDto.address.id,
            country: updateStructureDto.address.country,
            city: updateStructureDto.address.city,
            streetL1: updateStructureDto.address.streetL1,
            streetL2: updateStructureDto.address.streetL2,
            postcode: updateStructureDto.address.postcode,
            latitude: updateStructureDto.address.latitude,
            longitude: updateStructureDto.address.longitude,
          },
        };
      }

      // Exécuter la mise à jour de la structure
      const updatedStructure = await prisma.structure.update({
        where: { id },
        data: updateData,
        include: {
          address: true,
          users: {
            omit: { password: true },
          },
        },
      });

      // Comparer les champs modifiés
      const modifiedFields = (
        Object.keys(updateStructureDto) as (keyof UpdateStructureDto)[]
      )
        .filter((key) => {
          const oldValue = existingStructure[key];
          const newValue = updateStructureDto[key];
          return oldValue !== newValue; // Comparer les anciennes et nouvelles valeurs
        })
        .map((key) => ({
          field: key as string,
          previousValue: existingStructure[key]?.toString() || '',
          newValue: updateStructureDto[key]?.toString() || '',
        }));

      // Enregistrer les logs d'audit
      await this.auditLogService.createAuditLog(
        user.id,
        updatedStructure.id,
        LinkedTable.STRUCTURE,
        'UPDATE',
        modifiedFields,
      );

      return updatedStructure;
    });
  }

  async remove(id: number): Promise<Structure> {
    return await this.prisma.structure.delete({
      where: { id },
    });
  }

  // relation with users

  async addUserToStructure(
    structureId: number,
    userId: number,
    request: AuthenticatedRequest,
  ): Promise<Structure> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Récupérer les détails de l'utilisateur à ajouter
    const userToAdd = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return await this.prisma.$transaction(async (prisma) => {
      const updatedStructure = await prisma.structure.update({
        where: { id: structureId },
        data: {
          users: {
            connect: { id: userId },
          },
        },
        include: {
          users: true,
          tickets: true,
        },
      });

      // Log d'audit pour l'ajout d'un utilisateur
      await this.auditLogService.createAuditLog(
        user.id,
        structureId,
        LinkedTable.STRUCTURE,
        'ADD_USER',
        [
          {
            field: 'users',
            previousValue: '',
            newValue: userToAdd
              ? userToAdd.firstname + ' ' + userToAdd.lastname
              : 'Utilisateur inconnu', // Inclure le nom de l'utilisateur
          },
        ],
      );

      return updatedStructure;
    });
  }

  // Suppression d'un utilisateur d'une structure avec transaction
  async removeUserFromStructure(
    structureId: number,
    userId: number,
    request: AuthenticatedRequest,
  ): Promise<Structure> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Récupérer les détails de l'utilisateur à retirer
    const userToRemove = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return await this.prisma.$transaction(async (prisma) => {
      const updatedStructure = await prisma.structure.update({
        where: { id: structureId },
        data: {
          users: {
            disconnect: { id: userId },
          },
        },
        include: {
          users: true,
          tickets: true,
        },
      });

      // Log d'audit pour la suppression d'un utilisateur
      await this.auditLogService.createAuditLog(
        user.id,
        structureId,
        LinkedTable.STRUCTURE,
        'REMOVE_USER',
        [
          {
            field: 'users',
            previousValue: userToRemove
              ? userToRemove.firstname + ' ' + userToRemove.lastname
              : 'Utilisateur inconnu',
            newValue: '',
          },
        ],
      );

      return updatedStructure;
    });
  }

  async getStructuresByUser(userId: number): Promise<Structure[]> {
    return await this.prisma.structure.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        address: true,
        users: {
          omit: { password: true },
        },
        tickets: true,
      },
    });
  }
}
