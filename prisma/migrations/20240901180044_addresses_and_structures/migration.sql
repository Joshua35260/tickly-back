-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "structureId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
