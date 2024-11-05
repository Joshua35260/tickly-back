import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Media } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';
@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createMedia(createMediaDto: CreateMediaDto): Promise<Media> {
    const { filename, mimetype, userId, ticketId, structureId, commentId } =
      createMediaDto;

    // Validation
    if (!filename) {
      throw new BadRequestException('Filename must not be empty.');
    }

    return await this.prisma.$transaction(async (prisma) => {
      // Si un commentId est fourni, nous vérifions s'il y a déjà un média associé
      let oldMedia: Media | null = null;
      if (commentId) {
        oldMedia = await prisma.media.findFirst({
          where: { commentId: Number(commentId) },
        });
      }

      // Si un ancien média existe, le supprimer ou le dissocier
      if (oldMedia) {
        // Supprimer le média anciennement associé
        await prisma.media.delete({
          where: { id: oldMedia.id },
        });
      }

      // Créer l'entrée dans Media avec le nom du fichier
      const media = await prisma.media.create({
        data: {
          filename,
          typemime: mimetype,
        },
      });

      const mediaUrl = `/uploads/${media.filename}`;

      // Mettre à jour le média avec l'URL
      await prisma.media.update({
        where: { id: media.id },
        data: { url: mediaUrl },
      });

      // Mise à jour de l'avatar de l'utilisateur si un userId est fourni
      if (userId) {
        await prisma.user.update({
          where: { id: Number(userId) },
          data: {
            avatar: { connect: { id: media.id } },
            avatarUrl: mediaUrl,
            avatarId: media.id, // Assurez-vous de mettre à jour avatarId
          },
        });
      }

      // Mise à jour du ticket avec le nouveau média
      if (ticketId) {
        await prisma.ticket.update({
          where: { id: Number(ticketId) },
          data: {
            medias: { connect: { id: media.id } }, // Connecter le média au ticket
          },
        });
      }

      // Mise à jour de l'avatar de la structure si un structureId est fourni
      if (structureId) {
        await prisma.structure.update({
          where: { id: Number(structureId) },
          data: {
            avatar: { connect: { id: media.id } },
            avatarUrl: mediaUrl,
            avatarId: media.id,
          },
        });
      }

      // Mise à jour du commentaire avec le nouveau média
      if (commentId) {
        await prisma.comment.update({
          where: { id: Number(commentId) },
          data: {
            media: { connect: { id: media.id } },
            mediaUrl: mediaUrl,
            mediaId: media.id,
          },
        });
      }

      return { ...media, url: mediaUrl };
    });
  }

  async findAll(): Promise<Media[]> {
    return this.prisma.media.findMany();
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const existingMedia = await this.findOne(id);
    return this.prisma.media.update({
      where: { id: existingMedia.id },
      data: {
        ...updateMediaDto,
      },
    });
  }

  async remove(id: number): Promise<void> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Supprimer le fichier physique (si nécessaire)
    const filePath = join(process.cwd(), 'uploads', media.url); // Chemin du fichier
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Supprimer le fichier sur le système de fichiers
    }

    // Dissocier le média des utilisateurs
    await this.prisma.user.updateMany({
      where: { avatarId: media.id },
      data: {
        avatarId: null,
        avatarUrl: null,
      },
    });

    // Dissocier le média des tickets
    await this.prisma.media.update({
      where: { id: media.id },
      data: {
        tickets: {
          disconnect: { id: media.id },
        },
      },
    });

    // Dissocier le média des structures
    await this.prisma.structure.updateMany({
      where: { avatarId: media.id },
      data: {
        avatarId: null,
        avatarUrl: null,
      },
    });

    // Dissocier le média des commentaires
    await this.prisma.comment.updateMany({
      where: { mediaId: media.id },
      data: {
        mediaId: null,
        mediaUrl: null,
      },
    });

    // Supprimer l'entrée de la base de données
    await this.prisma.media.delete({
      where: { id },
    });
  }
}
