/*
  Warnings:

  - A unique constraint covering the columns `[authorId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[structureId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Structure" ADD COLUMN     "ticketId" INTEGER;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "structureId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_authorId_key" ON "Ticket"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_structureId_key" ON "Ticket"("structureId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
