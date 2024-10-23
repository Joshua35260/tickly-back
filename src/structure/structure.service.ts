import {
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

    // Transaction pour créer la structure et l'audit
    return await this.prisma.$transaction(async (prisma) => {
      const newStructure = await prisma.structure.create({
        data: {
          name: createStructureDto.name,
          type: createStructureDto.type,
          service: createStructureDto.service,
          emails: {
            create: createStructureDto.emails || [],
          },
          phones: {
            create: createStructureDto.phones || [],
          },
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
          emails: true,
          phones: true,
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
        'Structure', // Table liée
        'CREATE', // Action de création
        [], // Aucun champ modifié pour une création
      );

      return newStructure;
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: FilterStructureDto,
  ): Promise<{
    page: number;
    pageSize: number;
    total: number;
    items: Structure[];
  }> {
    const { page, pageSize } = pagination;

    // Construire directement le "where" Prisma à partir des filtres venant des query params
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
      emails: filters?.emails
        ? {
            some: {
              email: { equals: filters.emails }, // Compare directement la chaîne
            },
          }
        : undefined,
      phones: filters?.phones
        ? {
            some: {
              phone: { equals: filters.phones }, // Compare directement la chaîne
            },
          }
        : undefined,
      users: filters?.users
        ? {
            some: {
              OR: [
                { firstname: { contains: filters.users, mode: 'insensitive' } }, // Recherche sur firstname
                { lastname: { contains: filters.users, mode: 'insensitive' } }, // Recherche sur lastname
              ],
            },
          }
        : undefined,

      address: filters?.address
        ? { streetL1: { contains: filters.address, mode: 'insensitive' } }
        : undefined,
    };

    // Récupération des structures avec pagination et filtres
    const [structures, totalCount] = await this.prisma.$transaction([
      this.prisma.structure.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          address: true,
          emails: true,
          phones: true,
          users: {
            omit: { password: true },
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

  async findOne(id: number): Promise<Structure | null> {
    return await this.prisma.structure.findUnique({
      where: { id },
      include: {
        emails: true,
        phones: true,
        address: true,
        users: {
          omit: { password: true },
        },
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
          emails: true,
          phones: true,
          address: true,
          users: {
            omit: { password: true },
          },
        },
      });

      if (!existingStructure) {
        throw new NotFoundException(`Structure with ID ${id} not found`);
      }

      // Préparer les données pour la mise à jour
      const updateData: any = {
        ...updateStructureDto, // Inclure tous les champs de la DTO
        phones: undefined, // Exclure temporairement pour traitement
        emails: undefined, // Exclure temporairement pour traitement
        address: undefined, // Exclure temporairement pour traitement
      };

      // Mettre à jour les téléphones s'ils sont fournis
      if (updateStructureDto.phones?.length > 0) {
        updateData.phones = {
          update: updateStructureDto.phones
            .filter((phone) => phone.id) // Ne mettre à jour que les téléphones avec un id
            .map((phone) => ({
              where: { id: phone.id },
              data: {
                phone: phone.phone,
                type: phone.type,
              },
            })),
          create: updateStructureDto.phones
            .filter((phone) => !phone.id) // Créer de nouveaux téléphones sans id
            .map((phone) => ({
              phone: phone.phone,
              type: phone.type,
            })),
        };
      }

      // Mettre à jour les e-mails s'ils sont fournis
      if (updateStructureDto.emails?.length > 0) {
        updateData.emails = {
          update: updateStructureDto.emails
            .filter((email) => email.id) // Ne mettre à jour que les e-mails avec un id
            .map((email) => ({
              where: { id: email.id },
              data: {
                email: email.email,
                type: email.type,
              },
            })),
          create: updateStructureDto.emails
            .filter((email) => !email.id) // Créer de nouveaux e-mails sans id
            .map((email) => ({
              email: email.email,
              type: email.type,
            })),
        };
      }

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
          emails: true,
          phones: true,
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
        'Structure',
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

    // Utilisation d'une transaction pour s'assurer que les deux opérations réussissent ou échouent ensemble
    return await this.prisma.$transaction(async (prisma) => {
      // Mise à jour de la structure en ajoutant l'utilisateur
      const updatedStructure = await prisma.structure.update({
        where: { id: structureId },
        data: {
          users: {
            connect: { id: userId }, // Connecter l'utilisateur à la structure
          },
        },
        include: {
          users: true,
        },
      });

      // Log d'audit pour l'ajout d'un utilisateur
      await this.auditLogService.createAuditLog(
        user.id,
        structureId,
        'Structure',
        'ADD_USER',
        [{ field: 'users', previousValue: '', newValue: userId.toString() }],
      );

      return updatedStructure; // Retourner la structure mise à jour
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

    // Utilisation d'une transaction pour s'assurer que les deux opérations réussissent ou échouent ensemble
    return await this.prisma.$transaction(async (prisma) => {
      // Mise à jour de la structure en retirant l'utilisateur
      const updatedStructure = await prisma.structure.update({
        where: { id: structureId },
        data: {
          users: {
            disconnect: { id: userId }, // Déconnecter l'utilisateur de la structure
          },
        },
        include: {
          users: true,
        },
      });

      // Log d'audit pour la suppression d'un utilisateur
      await this.auditLogService.createAuditLog(
        user.id,
        structureId,
        'Structure',
        'REMOVE_USER',
        [{ field: 'users', previousValue: userId.toString(), newValue: '' }],
      );

      return updatedStructure; // Retourner la structure mise à jour
    });
  }
}
