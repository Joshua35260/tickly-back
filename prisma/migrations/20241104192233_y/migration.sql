/*
  Warnings:

  - You are about to drop the column `ticketId` on the `Structure` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Ticket_structureId_key";

-- AlterTable
ALTER TABLE "Structure" DROP COLUMN "ticketId";
