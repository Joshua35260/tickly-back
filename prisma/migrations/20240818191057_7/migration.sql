/*
  Warnings:

  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Role` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[role]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_A_fkey";

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("role");

-- AlterTable
ALTER TABLE "_UserRoles" ALTER COLUMN "A" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_key" ON "Role"("role");

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("role") ON DELETE CASCADE ON UPDATE CASCADE;
