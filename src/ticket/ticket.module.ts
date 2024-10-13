import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogModule } from '../../src/auditlog/auditlog.module';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  imports: [PrismaModule, AuditLogModule],
  exports: [TicketService],
})
export class TicketModule {}
