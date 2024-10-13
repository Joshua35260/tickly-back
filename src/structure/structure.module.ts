import { Module } from '@nestjs/common';
import { StructureService } from './structure.service';
import { StructureController } from './structure.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { AuditLogModule } from 'src/auditlog/auditlog.module';

@Module({
  controllers: [StructureController],
  providers: [StructureService],
  imports: [PrismaModule, AuditLogModule],
  exports: [StructureService],
})
export class StructureModule {}
