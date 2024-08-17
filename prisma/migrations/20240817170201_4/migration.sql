/*
  Warnings:

  - Made the column `type` on table `Email` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `Phone` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Email" ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "Phone" ALTER COLUMN "type" SET NOT NULL;
