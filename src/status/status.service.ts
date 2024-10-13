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
    });
  }

  async findAll(): Promise<Status[]> {
    return await this.prisma.status.findMany({});
  }

  async findOne(id: number): Promise<Status | null> {
    return await this.prisma.status.findUnique({
      where: { id },
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
    });
  }

  async remove(id: number): Promise<Status> {
    return await this.prisma.status.delete({
      where: { id },
    });
  }
}
