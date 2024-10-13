import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Address } from '@prisma/client';
@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCreateAddressDtoDto: CreateAddressDto): Promise<Address> {
    // Destructure the createStructureDto and exclude the id field

    return await this.prisma.address.create({
      data: {
        ...createCreateAddressDtoDto,
      },
    });
  }

  async findAll(): Promise<Address[]> {
    return await this.prisma.address.findMany({});
  }

  async findOne(id: number): Promise<Address | null> {
    return await this.prisma.address.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address | null> {
    // Exécuter la mise à jour de la structure
    return await this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
    });
  }

  async remove(id: number): Promise<Address> {
    return await this.prisma.address.delete({
      where: { id },
    });
  }
}
