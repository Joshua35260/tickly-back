import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { PriorityController } from './priority.controller';
import { PriorityService } from './priority.service';

@Module({
  controllers: [PriorityController],
  providers: [PriorityService],
  imports: [PrismaModule],
  exports: [PriorityService],
})
export class PriorityModule {}
