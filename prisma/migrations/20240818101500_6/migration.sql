/*
  Warnings:

  - You are about to drop the column `userId` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Phone` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_userId_fkey";

-- DropForeignKey
ALTER TABLE "Phone" DROP CONSTRAINT "Phone_userId_fkey";

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Phone" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "Structure" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(100),
    "service" VARCHAR(50),

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserEmails" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_StructureEmails" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserPhones" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_StructurePhones" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserEmails_AB_unique" ON "_UserEmails"("A", "B");

-- CreateIndex
CREATE INDEX "_UserEmails_B_index" ON "_UserEmails"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_StructureEmails_AB_unique" ON "_StructureEmails"("A", "B");

-- CreateIndex
CREATE INDEX "_StructureEmails_B_index" ON "_StructureEmails"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserPhones_AB_unique" ON "_UserPhones"("A", "B");

-- CreateIndex
CREATE INDEX "_UserPhones_B_index" ON "_UserPhones"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_StructurePhones_AB_unique" ON "_StructurePhones"("A", "B");

-- CreateIndex
CREATE INDEX "_StructurePhones_B_index" ON "_StructurePhones"("B");

-- AddForeignKey
ALTER TABLE "_UserEmails" ADD CONSTRAINT "_UserEmails_A_fkey" FOREIGN KEY ("A") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserEmails" ADD CONSTRAINT "_UserEmails_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StructureEmails" ADD CONSTRAINT "_StructureEmails_A_fkey" FOREIGN KEY ("A") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StructureEmails" ADD CONSTRAINT "_StructureEmails_B_fkey" FOREIGN KEY ("B") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPhones" ADD CONSTRAINT "_UserPhones_A_fkey" FOREIGN KEY ("A") REFERENCES "Phone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPhones" ADD CONSTRAINT "_UserPhones_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StructurePhones" ADD CONSTRAINT "_StructurePhones_A_fkey" FOREIGN KEY ("A") REFERENCES "Phone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StructurePhones" ADD CONSTRAINT "_StructurePhones_B_fkey" FOREIGN KEY ("B") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
