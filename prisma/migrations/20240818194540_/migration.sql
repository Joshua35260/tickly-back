/*
  Warnings:

  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `role` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `firstname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `lastname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `login` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `A` on the `_UserRoles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- DropForeignKey
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_A_fkey";

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
ALTER COLUMN "role" SET DATA TYPE VARCHAR(50),
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("role");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstname" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "lastname" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "login" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "_UserRoles" ALTER COLUMN "A" SET DATA TYPE VARCHAR(50);

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("role") ON DELETE CASCADE ON UPDATE CASCADE;
