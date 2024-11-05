/*
  Warnings:

  - You are about to drop the column `targetId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `ticketId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Comment_targetId_targetType_idx";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "targetId",
DROP COLUMN "targetType",
ADD COLUMN     "ticketId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
