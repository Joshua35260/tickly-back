import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  // constructor() {
  //   super({
  //     log: ['query', 'info', 'warn', 'error'], // Activez la journalisation ici
  //   });
  // }
}
