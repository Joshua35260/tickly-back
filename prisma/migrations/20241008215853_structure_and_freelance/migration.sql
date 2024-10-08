/*
  Warnings:

  - You are about to drop the column `structureId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Address` table. All the data in the column will be lost.
  - Added the required column `addressId` to the `Structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTypeId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_structureId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "structureId",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Structure" ADD COLUMN     "addressId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressId" INTEGER NOT NULL,
ADD COLUMN     "jobTypeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "JobType" (
    "jobType" VARCHAR(50) NOT NULL,

    CONSTRAINT "JobType_pkey" PRIMARY KEY ("jobType")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "JobType"("jobType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
