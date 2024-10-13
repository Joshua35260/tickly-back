import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createAuditLog(
    userId: number,
    linkedId: number,
    linkedTable: string,
    action: string,
    modifiedFields?: {
      field: string;
      previousValue: string;
      newValue: string;
    }[],
  ) {
    // Gérer la suppression des anciens logs avant d'en créer un nouveau
    await this.manageAuditLogs(linkedId, linkedTable);

    // Créer l'entrée dans AuditLog
    const auditLog = await this.prisma.auditLog.create({
      data: {
        userId,
        linkedId,
        linkedTable,
        action,
        modificationDate: new Date(),
      },
    });

    // Créer les entrées dans AuditLogValue pour chaque champ modifié
    if (modifiedFields) {
      for (const field of modifiedFields) {
        await this.prisma.auditLogValue.create({
          data: {
            auditLogId: auditLog.id,
            field: field.field,
            previousValue: field.previousValue,
            newValue: field.newValue,
          },
        });
      }
    }
  }

  private async manageAuditLogs(linkedId: number, linkedTable: string) {
    // Récupérer tous les logs d'audit liés à cet ID et cette table
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        linkedId,
        linkedTable,
      },
      orderBy: {
        modificationDatetime: 'asc', // Ordre croissant pour obtenir les plus anciens
      },
    });

    // Si le nombre de logs dépasse 50, supprimer les plus anciens
    if (auditLogs.length >= 50) {
      const logsToDelete = auditLogs.slice(0, auditLogs.length - 49); // Conserver les 49 plus récents
      await this.prisma.auditLog.deleteMany({
        where: {
          id: {
            in: logsToDelete.map((log) => log.id),
          },
        },
      });
    }
  }
}
