/*
  Warnings:

  - You are about to drop the `_StructureMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserMedia` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userAvatarId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[structureAvatarId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_StructureMedia" DROP CONSTRAINT "_StructureMedia_A_fkey";

-- DropForeignKey
ALTER TABLE "_StructureMedia" DROP CONSTRAINT "_StructureMedia_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserMedia" DROP CONSTRAINT "_UserMedia_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserMedia" DROP CONSTRAINT "_UserMedia_B_fkey";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "structureAvatarId" INTEGER,
ADD COLUMN     "userAvatarId" INTEGER;

-- AlterTable
ALTER TABLE "Structure" ADD COLUMN     "avatarId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarId" INTEGER;

-- DropTable
DROP TABLE "_StructureMedia";

-- DropTable
DROP TABLE "_UserMedia";

-- CreateIndex
CREATE UNIQUE INDEX "Media_userAvatarId_key" ON "Media"("userAvatarId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_structureAvatarId_key" ON "Media"("structureAvatarId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userAvatarId_fkey" FOREIGN KEY ("userAvatarId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_structureAvatarId_fkey" FOREIGN KEY ("structureAvatarId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
