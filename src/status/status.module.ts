import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';

@Module({
  controllers: [StatusController],
  providers: [StatusService],
  imports: [PrismaModule],
  exports: [StatusService],
})
export class StatusModule {}
