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
  ): Promise<{
    page: number;
    pageSize: number;
    total: number;
    items: Omit<User, 'password'>[];
  }> {
    const { page, pageSize } = pagination;

    // Construire directement le "where" Prisma à partir des filtres venant des query params
    const where: Prisma.UserWhereInput = {
      id: filters?.id ? Number(filters.id) : undefined,
      firstname: filters?.firstname
        ? { contains: filters.firstname, mode: 'insensitive' } // Recherche partielle insensible à la casse
        : undefined,
      lastname: filters?.lastname
        ? { contains: filters.lastname, mode: 'insensitive' }
        : undefined,
      phone: filters?.phone
        ? { contains: filters.phone, mode: 'insensitive' } // Recherche partielle insensible à la casse
        : undefined,
      email: filters?.email
        ? { contains: filters.email, mode: 'insensitive' } // Recherche partielle insensible à la casse
        : undefined,
      roles: filters?.roles
        ? { some: { role: { equals: filters.roles, mode: 'insensitive' } } } // Vérifie si l'utilisateur a l'un des rôles spécifiés
        : undefined,

      address: filters?.address
        ? { streetL1: { contains: filters.address, mode: 'insensitive' } }
        : undefined,
      structures: filters?.structures
        ? {
            some: { name: { equals: filters.structures, mode: 'insensitive' } },
          }
        : undefined,
    };

    // Récupération des utilisateurs avec pagination et filtres
    const [users, totalCount] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          roles: true,
          address: true,
          structures: true,
        },
        omit: { password: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total: totalCount,
      items: users.map((user) => ({
        ...user,
      })),
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
      const existingUser = (await prisma.user.findUnique({
        where: { id },
        include: {
          roles: true,
          address: true,
        },
      })) as UserEntity;

      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          roundsOfHashing,
        );
      }

      const { roles, address, ...userData } = updateUserDto;

      const updateData: any = {
        ...userData,
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

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          roles: true,
          address: true,
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
            return oldValue !== newValue; // Comparer les anciennes et nouvelles valeurs
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
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
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

    // Utilisation d'une transaction pour s'assurer que les deux opérations réussissent ou échouent ensemble
    return await this.prisma.$transaction(async (prisma) => {
      // Mise à jour de l'utilisateur en ajoutant la structure
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
            newValue: structureId.toString(),
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

    // Utilisation d'une transaction pour s'assurer que les deux opérations réussissent ou échouent ensemble
    return await this.prisma.$transaction(async (prisma) => {
      // Mise à jour de l'utilisateur en retirant la structure
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
            previousValue: structureId.toString(),
            newValue: '',
          },
        ],
      );

      return updatedUser; // Retourner l'utilisateur mis à jour
    });
  }
}
