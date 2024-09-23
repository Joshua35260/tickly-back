-- CreateTable
CREATE TABLE "_UserStructures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserStructures_AB_unique" ON "_UserStructures"("A", "B");

-- CreateIndex
CREATE INDEX "_UserStructures_B_index" ON "_UserStructures"("B");

-- AddForeignKey
ALTER TABLE "_UserStructures" ADD CONSTRAINT "_UserStructures_A_fkey" FOREIGN KEY ("A") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserStructures" ADD CONSTRAINT "_UserStructures_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
