import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from './user/user.module';
import { StructureModule } from './structure/structure.module';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';
import { AddressModule } from './address/address.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { CommentModule } from './comment/comment.module';
import { AuditLogModule } from './auditlog/auditlog.module';
import { MediaModule } from './media/media.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    StructureModule,
    AuditLogModule,
    AuthModule,
    TicketModule,
    AddressModule,
    ConfigModule.forRoot({
      isGlobal: true, // Pour que la configuration soit accessible dans tout le projet
    }),
    CommentModule,
    MediaModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads/',
      serveStaticOptions: {
        setHeaders: (res) => {
          res.set('Cache-Control', 'public, max-age=31557600'); // Cache pour un an
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
