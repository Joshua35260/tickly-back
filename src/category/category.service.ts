import { Injectable } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '@prisma/client';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Destructure the createStructureDto and exclude the id field

    return await this.prisma.category.create({
      data: {
        ...createCategoryDto,
      },
      include: {
        ticket: true,
      },
    });
  }

  async findAll(): Promise<Category[]> {
    return await this.prisma.category.findMany({
      include: {
        ticket: true,
      },
    });
  }

  async findOne(id: number): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { id },
      include: {
        ticket: true,
      },
    });
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    // Exécuter la mise à jour de la structure
    return await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        ticket: true,
      },
    });
  }

  async remove(id: number): Promise<Category> {
    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
