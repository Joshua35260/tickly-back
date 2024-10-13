import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { RoleType } from '../../src/shared/enum/role.enum';
import { PaginationDto } from '../../src/shared/dto/pagination.dto';
import { JobType } from '../../src/shared/enum/job-type.enum';
import { FilterUserDto } from './dto/filter-user.dto';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Hash password if provided
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );
    }

    const defaultRole = RoleType.CLIENT;

    // Prepare jobType connection
    const jobTypeInput = {
      connect: { jobType: createUserDto.jobType },
    };

    let addressInput; // Déclare la variable ici

    // Check if the user is an employee
    if (createUserDto.jobType !== JobType.EMPLOYEE) {
      // non employee must have an address
      if (!createUserDto.address) {
        throw new BadRequestException('Freelancers must have an address.');
      }

      // Check if the address already exists
      if (createUserDto.address.id) {
        // If an address ID is provided, connect to the existing address
        addressInput = {
          connect: { id: createUserDto.address.id },
        };
      } else {
        // Otherwise, create a new address
        addressInput = {
          create: {
            country: createUserDto.address.country,
            city: createUserDto.address.city,
            streetL1: createUserDto.address.streetL1,
            streetL2: createUserDto.address.streetL2,
            postcode: createUserDto.address.postcode,
            latitude: createUserDto.address.latitude,
            longitude: createUserDto.address.longitude,
          },
        };
      }
    } else {
      // Non-freelancers must have at least one structure ID
      if (!createUserDto.structures || createUserDto.structures.length === 0) {
        throw new BadRequestException(
          'Non-freelance users must be associated with at least one structure.',
        );
      }
    }

    // Attempt to create user
    return await this.prisma.user.create({
      data: {
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        login: createUserDto.login,
        password: createUserDto.password,
        phones: {
          create: createUserDto.phones || [],
        },
        emails: {
          create: createUserDto.emails || [],
        },
        roles: {
          connectOrCreate: {
            where: { role: defaultRole },
            create: { role: defaultRole },
          },
        },
        // Add address input (either connect or create)
        address: addressInput,
        jobType: jobTypeInput,
        structures: createUserDto.structures
          ? {
              connect: createUserDto.structures.map((id) => ({ id })), // Connect existing structures by ID
            }
          : undefined,
      },
      include: {
        phones: true,
        emails: true,
        roles: true,
        address: true,
        jobType: true,
        structures: true,
      },
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
      jobType: filters?.jobType
        ? { is: { jobType: filters.jobType } } // is pour comparer directement la chaîne
        : undefined,
      roles: filters?.roles
        ? { some: { role: { equals: filters.roles, mode: 'insensitive' } } } // Vérifie si l'utilisateur a l'un des rôles spécifiés
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
          phones: true,
          emails: true,
          roles: true,
          address: true,
          structures: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total: totalCount,
      items: users.map((user) => ({
        ...user,
        password: undefined, // On omet le mot de passe
      })),
    };
  }

  async findOne(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        phones: true,
        emails: true,
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
  // omit: { password: true },
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'> | null> {
    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }

    const { phones, emails, roles, ...userData } = updateUserDto;

    const updateData: any = {
      ...userData,
    };

    // Mettre à jour les téléphones s'ils sont fournis
    if (phones?.length > 0) {
      updateData.phones = {
        update: phones
          .filter((phone) => phone.id) // Update only if the phone has an ID
          .map((phone) => ({
            where: { id: phone.id },
            data: {
              phone: phone.phone,
              type: phone.type,
            },
          })),
        create: phones
          .filter((phone) => !phone.id) // Create new phone if it has no ID
          .map((phone) => ({
            phone: phone.phone,
            type: phone.type,
          })),
      };
    }

    // Mettre à jour les e-mails s'ils sont fournis
    if (emails?.length > 0) {
      updateData.emails = {
        update: emails
          .filter((email) => email.id) // Update only if the email has an ID
          .map((email) => ({
            where: { id: email.id },
            data: {
              email: email.email,
              type: email.type,
            },
          })),
        create: emails
          .filter((email) => !email.id) // Create new email if it has no ID
          .map((email) => ({
            email: email.email,
            type: email.type,
          })),
      };
    }

    // Ne mettre à jour les rôles que s'ils sont fournis
    if (roles?.length > 0) {
      updateData.roles = {
        set: roles.map((role) => ({ role })),
        connectOrCreate: roles.map((role) => ({
          where: { role },
          create: { role },
        })),
      };
    }

    // Exécuter la mise à jour de l'utilisateur
    return await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        phones: true,
        emails: true,
        roles: true,
      },
      omit: { password: true },
    });
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
}
