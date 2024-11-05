/*
  Warnings:

  - You are about to drop the column `ticketId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `mediaId` on the `Ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_ticketId_fkey";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "ticketId";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "mediaId";

-- CreateTable
CREATE TABLE "_TicketMedia" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TicketMedia_AB_unique" ON "_TicketMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_TicketMedia_B_index" ON "_TicketMedia"("B");

-- AddForeignKey
ALTER TABLE "_TicketMedia" ADD CONSTRAINT "_TicketMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketMedia" ADD CONSTRAINT "_TicketMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
