/*
  Warnings:

  - You are about to drop the column `street_l1` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `street_l2` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `streetL1` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "street_l1",
DROP COLUMN "street_l2",
ADD COLUMN     "streetL1" VARCHAR(255) NOT NULL,
ADD COLUMN     "streetL2" VARCHAR(255);

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "author",
ADD COLUMN     "authorId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_AssignedUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AssignedUsers_AB_unique" ON "_AssignedUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_AssignedUsers_B_index" ON "_AssignedUsers"("B");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedUsers" ADD CONSTRAINT "_AssignedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedUsers" ADD CONSTRAINT "_AssignedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
