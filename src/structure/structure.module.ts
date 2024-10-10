import { Module } from '@nestjs/common';
import { StructureService } from './structure.service';
import { StructureController } from './structure.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [StructureController],
  providers: [StructureService],
  imports: [PrismaModule],
  exports: [StructureService],
})
export class StructureModule {}
