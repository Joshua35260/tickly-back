import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { AuditLogModule } from 'src/auditlog/auditlog.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [PrismaModule, AuditLogModule],
  exports: [UserService],
})
export class UserModule {}
