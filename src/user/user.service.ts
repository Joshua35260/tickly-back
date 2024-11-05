import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { RoleType } from '../../src/shared/enum/role.enum';
import { PaginationDto } from '../../src/shared/dto/pagination.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { AuthenticatedRequest } from 'src/auth/auth.service';
import { AuditLogService } from 'src/auditlog/auditlog.service';
import { UserEntity } from './entities/user.entity';
import { PrismaService } from 'prisma/prisma.service';
import { LinkedTable } from 'src/shared/enum/linked-table.enum';
import { plainToInstance } from 'class-transformer';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    request?: AuthenticatedRequest, // request est optionnel
  ): Promise<Omit<User, 'password'>> {
    // Utilisez l'utilisateur authentifié s'il est présent
    const user = request?.user;

    // Vérifiez si le mot de passe est fourni, puis le hachez
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );
    }

    const defaultRole = RoleType.CLIENT;

    // Préparez l'entrée d'adresse
    const addressInput = createUserDto.address
      ? {
          create: {
            country: createUserDto.address.country,
            city: createUserDto.address.city,
            streetL1: createUserDto.address.streetL1,
            streetL2: createUserDto.address.streetL2,
            postcode: createUserDto.address.postcode,
            latitude: createUserDto.address.latitude,
            longitude: createUserDto.address.longitude,
          },
        }
      : undefined;

    // Transaction pour créer l'utilisateur et l'audit
    return await this.prisma.$transaction(async (prisma) => {
      // Créez l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          firstname: createUserDto.firstname,
          lastname: createUserDto.lastname,
          login: createUserDto.login,
          password: createUserDto.password,
          email: createUserDto.email,
          phone: createUserDto.phone,
          roles: {
            connectOrCreate: {
              where: { role: defaultRole },
              create: { role: defaultRole },
            },
          },
          address: addressInput,
        },
        include: {
          roles: true,
          address: true,
        },
      });

      // Créer un log d'audit si un utilisateur est connecté
      if (user) {
        await this.auditLogService.createAuditLog(
          user.id, // Utilisateur actuel
          newUser.id, // ID de l'utilisateur créé
          LinkedTable.USER,
          'CREATE', // Action de création
          [], // Aucun champ modifié pour une création
        );
      }

      // Retourner l'utilisateur nouvellement créé, sans mot de passe
      return newUser;
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: FilterUserDto,
    sort?: string,
  ): Promise<{
    page: number;
    pageSize: number;
    total: number;
    items: User[]; // Type User pour les résultats
  }> {
    const { page, pageSize } = pagination;

    // Construire le "where" Prisma à partir des filtres
    const where: Prisma.UserWhereInput = {};

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

      // Conditions pour le prénom, le nom, le téléphone et l'email
      const nameConditions = searchTerms.flatMap((term) => [
        {
          firstname: {
            contains: term,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          lastname: { contains: term, mode: 'insensitive' as Prisma.QueryMode },
        },
        {
          phone: { contains: term, mode: 'insensitive' as Prisma.QueryMode }, // Recherche par téléphone
        },
        {
          email: { contains: term, mode: 'insensitive' as Prisma.QueryMode }, // Recherche par email
        },
        {
          address: {
            OR: [
              {
                streetL1: {
                  contains: term,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              }, // Recherche par rue
              {
                city: {
                  contains: term,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              }, // Recherche par ville
              {
                country: {
                  contains: term,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              }, // Recherche par pays
            ],
          },
        },
      ]);

      // Ajoutez les conditions dans un OR
      where.OR = nameConditions;
    }

    // Récupération des utilisateurs avec pagination et filtres
    const [users, totalCount] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: sort ? this.getSortCriteria(sort) : undefined,
        include: {
          address: true, // Inclure l'adresse de l'utilisateur
          structures: {
            include: {
              address: true, // Inclure l'adresse de la structure
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total: totalCount,
      items: users,
    };
  }

  // Méthode pour transformer le critère de tri
  private getSortCriteria(sort: string) {
    const sortParams = sort.split(' '); // 'firstname asc' devient ['firstname', 'asc']
    if (sortParams.length !== 2) {
      throw new Error('Invalid sort parameter');
    }
    return {
      [sortParams[0]]: sortParams[1].toLowerCase() === 'asc' ? 'asc' : 'desc',
    };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    request: AuthenticatedRequest,
  ): Promise<Omit<User, 'password'> | null> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return await this.prisma.$transaction(async (prisma) => {
      // Définir le type de `existingUser`
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: { address: true, roles: true, avatar: true, structures: true }, // Inclure l'adresse si nécessaire
      });

      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          roundsOfHashing,
        );
      }

      const { roles, address, avatarId, archivedAt, ...userData } =
        updateUserDto;

      const updateData: any = {
        ...userData,
        archivedAt: archivedAt || null,
        roles:
          roles?.length > 0
            ? {
                set: roles.map((role) => ({ role })),
                connectOrCreate: roles.map((role) => ({
                  where: { role },
                  create: { role },
                })),
              }
            : undefined,
        address: address
          ? address.id
            ? {
                connect: { id: address.id },
              }
            : {
                create: {
                  streetL1: address.streetL1,
                  streetL2: address.streetL2,
                  postcode: address.postcode,
                  city: address.city,
                  country: address.country,
                  latitude: address.latitude,
                  longitude: address.longitude,
                },
              }
          : undefined,
      };

      if (avatarId) {
        updateData.avatar = {
          connect: { id: avatarId }, // Connect the new avatar
        };
      }
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          roles: true,
          address: true,
          avatar: true,
        },
        omit: { password: true },
      });

      // Comparer les champs modifiés pour le log d'audit
      const modifiedFields = (
        Object.keys(updateUserDto) as Array<keyof UpdateUserDto>
      )
        .filter((key) => {
          // Vérifiez si la clé existe dans existingUser avant d'accéder
          if (key in existingUser) {
            const oldValue = existingUser[key];
            const newValue = updateUserDto[key];
            return oldValue !== newValue && key !== 'password'; // Comparer les anciennes et nouvelles valeurs
          }
          return false; // Ignore les clés non valides
        })
        .map((key) => ({
          field: key as string,
          previousValue: existingUser[key]?.toString() || '',
          newValue: updateUserDto[key]?.toString() || '',
        }));

      await this.auditLogService.createAuditLog(
        user.id,
        updatedUser.id,
        LinkedTable.USER,
        'UPDATE',
        modifiedFields,
      );

      return updatedUser;
    });
  }

  async findOne(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
        address: true,
        structures: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user; // Retourner l'instance UserEntity
  }

  async remove(id: number): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.delete({ where: { id }, omit: { password: true } });
  }

  async findByEmail(login: string): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: { login },
      omit: { password: true },
    });
  }

  // relation between user and structure
  async addStructureToUser(
    userId: number,
    structureId: number,
    request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Récupérer les détails de la structure à ajouter
    const structureToAdd = await this.prisma.structure.findUnique({
      where: { id: structureId },
    });

    return await this.prisma.$transaction(async (prisma) => {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          structures: {
            connect: { id: structureId }, // Connecter la structure à l'utilisateur
          },
        },
        include: {
          structures: true, // Inclure les structures mises à jour
        },
      });

      // Log d'audit pour l'ajout d'une structure
      await this.auditLogService.createAuditLog(
        user.id,
        userId,
        LinkedTable.USER,
        'ADD_STRUCTURE',
        [
          {
            field: 'structures',
            previousValue: '',
            newValue: structureToAdd
              ? structureToAdd.name
              : 'Structure inconnue', // Inclure le nom de la structure
          },
        ],
      );

      return updatedUser; // Retourner l'utilisateur mis à jour
    });
  }

  // Méthode pour retirer une structure d'un utilisateur
  async removeStructureFromUser(
    userId: number,
    structureId: number,
    request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Récupérer les détails de la structure à retirer
    const structureToRemove = await this.prisma.structure.findUnique({
      where: { id: structureId },
    });

    return await this.prisma.$transaction(async (prisma) => {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          structures: {
            disconnect: { id: structureId }, // Déconnecter la structure de l'utilisateur
          },
        },
        include: {
          structures: true, // Inclure les structures mises à jour
        },
      });

      // Log d'audit pour la suppression d'une structure
      await this.auditLogService.createAuditLog(
        user.id,
        userId,
        LinkedTable.USER,
        'REMOVE_STRUCTURE',
        [
          {
            field: 'structures',
            previousValue: structureToRemove
              ? structureToRemove.name
              : 'Structure inconnue', // Inclure le nom de la structure
            newValue: '',
          },
        ],
      );

      return updatedUser; // Retourner l'utilisateur mis à jour
    });
  }
}
