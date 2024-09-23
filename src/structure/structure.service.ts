import { Injectable } from '@nestjs/common';
import { CreateStructureDto } from './dto/create-structure.dto';
import { UpdateStructureDto } from './dto/update-structure.dto';
import { Structure } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class StructureService {
  constructor(private prisma: PrismaService) {}
  async create(createStructureDto: CreateStructureDto): Promise<Structure> {
    return await this.prisma.structure.create({
      data: {
        ...createStructureDto,
        emails: {
          create: createStructureDto.emails || [],
        },
        phones: {
          create: createStructureDto.phones || [],
        },
      },
      include: {
        emails: true,
        phones: true,
      },
    });
  }
  async findAll(): Promise<Structure[]> {
    return await this.prisma.structure.findMany({
      include: {
        emails: true,
        phones: true,
      },
    });
  }

  async findOne(id: number): Promise<Structure | null> {
    return await this.prisma.structure.findUnique({
      where: { id },
      include: {
        emails: true,
        phones: true,
      },
    });
  }

  async update(
    id: number,
    updateStructureDto: UpdateStructureDto,
  ): Promise<Structure> {
    const { phones = [], emails = [], ...structureData } = updateStructureDto;

    return await this.prisma.structure.update({
      where: { id },
      data: {
        ...structureData,
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
      },
      include: {
        emails: true,
        phones: true,
      },
    });
  }

  async remove(id: number): Promise<Structure> {
    return await this.prisma.structure.delete({
      where: { id },
    });
  }
}
