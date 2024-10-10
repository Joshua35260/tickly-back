import { Injectable } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { Status } from '@prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) {}
  async create(createStatusDto: CreateStatusDto): Promise<Status> {
    // Destructure the createStructureDto and exclude the id field

    return await this.prisma.status.create({
      data: {
        ...createStatusDto,
      },
      include: {
        ticket: true,
      },
    });
  }

  async findAll(): Promise<Status[]> {
    return await this.prisma.status.findMany({
      include: {
        ticket: true,
      },
    });
  }

  async findOne(id: number): Promise<Status | null> {
    return await this.prisma.status.findUnique({
      where: { id },
      include: {
        ticket: true,
      },
    });
  }

  async update(
    id: number,
    updateStatusDto: UpdateStatusDto,
  ): Promise<Status | null> {
    // Exécuter la mise à jour de la structure
    return await this.prisma.status.update({
      where: { id },
      data: updateStatusDto,
      include: {
        ticket: true,
      },
    });
  }

  async remove(id: number): Promise<Status> {
    return await this.prisma.status.delete({
      where: { id },
    });
  }
}
