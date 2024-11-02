import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LinkedTable } from 'src/shared/enum/linked-table.enum';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createAuditLog(
    userId: number,
    linkedId: number,
    linkedTable: LinkedTable,
    action: string,
    modifiedFields?: {
      field: string;
      previousValue?: string | null;
      newValue: string | null; // Autoriser newValue à être null
    }[],
  ) {
    // Gérer la suppression des anciens logs avant d'en créer un nouveau
    await this.manageAuditLogs(linkedId, linkedTable);

    // Fonction pour comparer les dates
    const areDatesEqual = (prev: Date | null, next: Date | null): boolean => {
      if (prev === null && next === null) return true;
      if (prev === null || next === null) return false;

      // Comparer uniquement jusqu'à la seconde
      return (
        Math.floor(prev.getTime() / 1000) === Math.floor(next.getTime() / 1000)
      );
    };

    // Filtrer les champs modifiés pour exclure ceux qui n'ont pas changés
    const filteredFields =
      modifiedFields?.filter((field) => {
        // Normaliser les valeurs de date
        const normalizeDate = (dateValue: string | null) => {
          if (!dateValue) return null;
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? null : date; // Retourne null si la date n'est pas valide
        };

        if (field.field.endsWith('At')) {
          const prevDate = normalizeDate(field.previousValue);
          const newDate = normalizeDate(field.newValue);
          return !areDatesEqual(prevDate, newDate);
        }
        return field.previousValue !== field.newValue;
      }) || [];

    // Ne pas créer de log si aucun champ n'a été modifié
    if (filteredFields.length === 0) {
      return; // Sortie anticipée si aucune modification
    }

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
    for (const field of filteredFields) {
      await this.prisma.auditLogValue.create({
        data: {
          auditLogId: auditLog.id,
          field: field.field,
          previousValue: field.previousValue, // Vous pouvez garder le format d'origine ici
          newValue: field.newValue, // Idem ici
        },
      });
    }
  }

  private async manageAuditLogs(linkedId: number, linkedTable: LinkedTable) {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        linkedId,
        linkedTable,
      },
      orderBy: {
        modificationDate: 'asc', // Ordre croissant pour obtenir les plus anciens
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

  async findAllByEntity(linkedId: number, linkedTable: LinkedTable) {
    return await this.prisma.auditLog.findMany({
      where: {
        linkedId,
        linkedTable,
      },
      include: {
        fields: true, // Inclure les champs modifiés si nécessaire
        user: true, // Inclure les détails de l'utilisateur si nécessaire
      },
      orderBy: {
        modificationDate: 'desc', // Les plus récents en premier
      },
    });
  }
}
