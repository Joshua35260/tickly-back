import { Injectable } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { Priority } from '@prisma/client';
import { UpdatePriorityDto } from './dto/update-priority.dto';

@Injectable()
export class PriorityService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPriorityDto: CreatePriorityDto): Promise<Priority> {
    // Destructure the createStructureDto and exclude the id field

    return await this.prisma.priority.create({
      data: {
        ...createPriorityDto,
      },
    });
  }

  async findAll(): Promise<Priority[]> {
    return await this.prisma.priority.findMany({});
  }

  async findOne(id: number): Promise<Priority | null> {
    return await this.prisma.priority.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    updatePriorityDto: UpdatePriorityDto,
  ): Promise<Priority | null> {
    // Exécuter la mise à jour de la structure
    return await this.prisma.priority.update({
      where: { id },
      data: updatePriorityDto,
    });
  }

  async remove(id: number): Promise<Priority> {
    return await this.prisma.priority.delete({
      where: { id },
    });
  }
}
