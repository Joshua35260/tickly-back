import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { RoleType } from 'src/shared/enum/role.enum';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'> | null> {
    // Hash password if provided
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );
    }
    const defaultRole = RoleType.CLIENT;
    // Attempt to create user
    return await this.prisma.user.create({
      data: {
        ...createUserDto,
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
      },
      include: {
        phones: true,
        emails: true,
        roles: true,
      },
      omit: { password: true },
    });
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      omit: { password: true },
      include: {
        phones: true,
        emails: true,
        roles: true,
      },
    });
  }

  async findOne(id: number): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        phones: true,
        emails: true,
        roles: true,
      },
      omit: { password: true },
    });
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

    const { phones = [], emails = [], roles = [], ...userData } = updateUserDto;

    if (roles.length === 0) {
      throw new Error('User must have at least one role.');
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        phones: {
          update: phones
            .filter((phone) => phone.id)
            .map((phone) => ({
              where: { id: phone.id },
              data: {
                phone: phone.phone,
                type: phone.type,
              },
            })),
          create: phones
            .filter((phone) => !phone.id)
            .map((phone) => ({
              phone: phone.phone,
              type: phone.type,
            })),
        },
        emails: {
          update: emails
            .filter((email) => email.id)
            .map((email) => ({
              where: { id: email.id },
              data: {
                email: email.email,
                type: email.type,
              },
            })),
          create: emails
            .filter((email) => !email.id)
            .map((email) => ({
              email: email.email,
              type: email.type,
            })),
        },
        roles: {
          set: roles.map((role) => ({ role })),
          connectOrCreate: roles.map((role) => ({
            where: { role },
            create: { role },
          })),
        },
      },
      include: {
        phones: true,
        emails: true,
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
