/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `_TicketCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TicketCategories" DROP CONSTRAINT "_TicketCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_TicketCategories" DROP CONSTRAINT "_TicketCategories_B_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "_TicketCategories";

-- CreateTable
CREATE TABLE "_TicketCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TicketCategory_AB_unique" ON "_TicketCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_TicketCategory_B_index" ON "_TicketCategory"("B");

-- AddForeignKey
ALTER TABLE "_TicketCategory" ADD CONSTRAINT "_TicketCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketCategory" ADD CONSTRAINT "_TicketCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
