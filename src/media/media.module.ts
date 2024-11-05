import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from 'prisma/prisma.module';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        // destination: join(process.cwd(), 'uploads'), // Utiliser process.cwd() pour pointer vers la racine du projet
        destination: join(process.cwd(), process.env.UPLOADS_PATH || 'uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const name = file.originalname.replace(
            extname(file.originalname),
            '',
          );
          cb(null, `${name}-${uniqueSuffix}${extname(file.originalname)}`); // Nom personnalisé
        },
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
