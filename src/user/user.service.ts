import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { RoleType } from 'src/shared/enum/role.enum';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

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

    // Prepare jobType connection (connect to an existing JobType)
    const jobTypeInput = {
      connect: { jobType: createUserDto.jobType }, // Connect using 'jobType' field as it's the primary key
    };

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
        address: {
          // Directly create address without nesting
          create: {
            country: createUserDto.address.country,
            city: createUserDto.address.city,
            street_l1: createUserDto.address.street_l1,
            street_l2: createUserDto.address.street_l2, // Make sure to adjust based on your AddressDto
            postcode: createUserDto.address.postcode,
            latitude: createUserDto.address.latitude,
            longitude: createUserDto.address.longitude,
          },
        },
        jobType: jobTypeInput, // Connect to the existing JobType
      },
      include: {
        phones: true,
        emails: true,
        roles: true,
        address: true,
        jobType: true,
      },
    });
  }

  async findAll({ page = 1, pageSize = 20 }: PaginationDto): Promise<{
    page: number;
    pageSize: number;
    total: number;
    items: Omit<User, 'password'>[];
  }> {
    const [users, totalCount] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          phones: true,
          emails: true,
          roles: true,
          address: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      page,
      pageSize,
      total: totalCount,
      items: users,
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
      },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

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
