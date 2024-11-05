/*
  Warnings:

  - A unique constraint covering the columns `[commentId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_mediaId_fkey";

-- DropIndex
DROP INDEX "Comment_mediaId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Media_commentId_key" ON "Media"("commentId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
