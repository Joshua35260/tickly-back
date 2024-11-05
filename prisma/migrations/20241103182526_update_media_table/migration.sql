/*
  Warnings:

  - You are about to drop the `_TicketMedia` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[mediaId]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_TicketMedia" DROP CONSTRAINT "_TicketMedia_A_fkey";

-- DropForeignKey
ALTER TABLE "_TicketMedia" DROP CONSTRAINT "_TicketMedia_B_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "mediaId" INTEGER;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "commentId" INTEGER;

-- AlterTable
ALTER TABLE "Structure" ADD COLUMN     "avatarUrl" VARCHAR(500);

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "mediaId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" VARCHAR(500);

-- DropTable
DROP TABLE "_TicketMedia";

-- CreateIndex
CREATE UNIQUE INDEX "Comment_mediaId_key" ON "Comment"("mediaId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
