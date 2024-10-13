import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from './user/user.module';
import { StructureModule } from './structure/structure.module';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';
import { CategoryModule } from './category/category.module';
import { PriorityModule } from './priority/priority.module';
import { StatusModule } from './status/status.module';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    StructureModule,
    AuthModule,
    TicketModule,
    CategoryModule,
    PriorityModule,
    StatusModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
