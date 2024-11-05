import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {}

  @Post('')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiExtraModels(CreateMediaDto)
  @UseInterceptors(FileInterceptor('file')) // Le champ 'file' est celui qui contiendra le fichier
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    dto: {
      userId?: number;
      ticketId?: number;
      structureId?: number;
      commentId?: number;
    },
  ) {
    const createMediaDto: CreateMediaDto = {
      filename: file.filename,
      mimetype: file.mimetype,
      userId: dto.userId, // Ajout de userId
      ticketId: dto.ticketId, // Ajout de ticketId
      structureId: dto.structureId, // Ajout de structureId
      commentId: dto.commentId,
      url: `/uploads/${file.filename}`, // Assurez-vous que le chemin est correct
    };

    return await this.mediaService.createMedia(createMediaDto);
  }

  @Get()
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiExtraModels(CreateMediaDto)
  async findAll() {
    return await this.mediaService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // Appeler le service pour supprimer le média
    await this.mediaService.remove(id);
    return { message: `Media with ID ${id} successfully deleted.` };
  }
}
