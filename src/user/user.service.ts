import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash password if provided
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );
    }

    try {
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
        },
        include: {
          phones: true,
          emails: true,
        },
      });
    } catch (error) {
      // Handle specific error for unique constraint violation
      if (error.code === 'P2002') {
        throw new ConflictException('A user with this login already exists.');
      }
      // Re-throw other errors
      throw error;
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      omit: { password: true },
      include: {
        phones: true,
        emails: true,
      },
    });
  }

  async findOne(id: number): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }

    // Destructure new phone and email data, and the rest
    const { phones = [], emails = [], ...userData } = updateUserDto;

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...userData,
          phones: {
            // Update existing phones
            update: phones
              .filter((phone) => phone.id)
              .map((phone) => ({
                where: { id: phone.id },
                data: { phone: phone.phone, type: phone.type },
              })),
            // Create new phones
            create: phones
              .filter((phone) => !phone.id)
              .map((phone) => ({
                phone: phone.phone,
                type: phone.type,
              })),
          },
          emails: {
            // Update existing emails
            update: emails
              .filter((email) => email.id)
              .map((email) => ({
                where: { id: email.id },
                data: { email: email.email, type: email.type },
              })),
            // Create new emails
            create: emails
              .filter((email) => !email.id)
              .map((email) => ({
                email: email.email,
                type: email.type,
              })),
          },
        },
        include: {
          phones: true,
          emails: true,
        },
      });
    } catch (error) {
      // Handle specific errors if necessary
      if (error.code === 'P2002') {
        throw new ConflictException('A unique constraint violation occurred.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findByEmail(login: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { login },
    });
  }
}
