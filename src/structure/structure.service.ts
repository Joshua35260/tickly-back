import { Injectable } from '@nestjs/common';
import { CreateStructureDto } from './dto/create-structure.dto';
import { UpdateStructureDto } from './dto/update-structure.dto';
import { Structure } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class StructureService {
  constructor(private prisma: PrismaService) {}
  async create(createStructureDto: CreateStructureDto): Promise<Structure> {
    // Destructure the createStructureDto and exclude the id field
    const { id, ...structureData } = createStructureDto;

    return await this.prisma.structure.create({
      data: {
        ...structureData, // This will now exclude the id field
        emails: {
          create: createStructureDto.emails || [], // Create emails
        },
        phones: {
          create: createStructureDto.phones || [], // Create phones
        },
        address: {
          // Directly create address without nesting
          create: {
            country: createStructureDto.address.country,
            city: createStructureDto.address.city,
            street_l1: createStructureDto.address.street_l1,
            street_l2: createStructureDto.address.street_l2, // Make sure to adjust based on your AddressDto
            postcode: createStructureDto.address.postcode,
            latitude: createStructureDto.address.latitude,
            longitude: createStructureDto.address.longitude,
          },
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
  ): Promise<Structure | null> {
    const {
      phones = [],
      emails = [],
      address,
      ...structureData
    } = updateStructureDto;

    const updateData: any = {
      ...structureData, // Autres champs de la structure
    };

    // Mettre à jour les téléphones s'ils sont fournis
    if (phones?.length > 0) {
      updateData.phones = {
        update: phones
          .filter((phone) => phone.id) // Ne mettre à jour que les téléphones avec un id
          .map((phone) => ({
            where: { id: phone.id },
            data: {
              phone: phone.phone,
              type: phone.type,
            },
          })),
        create: phones
          .filter((phone) => !phone.id) // Créer de nouveaux téléphones sans id
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
          .filter((email) => email.id) // Ne mettre à jour que les e-mails avec un id
          .map((email) => ({
            where: { id: email.id },
            data: {
              email: email.email,
              type: email.type,
            },
          })),
        create: emails
          .filter((email) => !email.id) // Créer de nouveaux e-mails sans id
          .map((email) => ({
            email: email.email,
            type: email.type,
          })),
      };
    }

    // Mettre à jour l'adresse si elle est fournie
    if (address) {
      updateData.address = {
        update: {
          id: address.id, // ID requis pour la mise à jour
          country: address.country,
          city: address.city,
          street_l1: address.street_l1,
          street_l2: address.street_l2,
          postcode: address.postcode,
          latitude: address.latitude,
          longitude: address.longitude,
        },
      };
    }

    // Exécuter la mise à jour de la structure
    return await this.prisma.structure.update({
      where: { id },
      data: updateData,
      include: {
        emails: true,
        phones: true,
        address: true,
      },
    });
  }

  async remove(id: number): Promise<Structure> {
    return await this.prisma.structure.delete({
      where: { id },
    });
  }
}
