import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogService } from './auditlog.service';

@Module({
  providers: [AuditLogService],
  imports: [PrismaModule],
  exports: [AuditLogService],
})
export class AuditLogModule {}
