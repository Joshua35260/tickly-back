import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogService } from './auditlog.service';
import { AuditLogController } from './augitlog.controller';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService],
  imports: [PrismaModule],
  exports: [AuditLogService],
})
export class AuditLogModule {}
