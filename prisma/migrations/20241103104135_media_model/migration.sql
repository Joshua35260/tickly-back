-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "typemime" VARCHAR(100) NOT NULL,
    "ticketId" INTEGER,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StructureMedia" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserMedia" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TicketMedia" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StructureMedia_AB_unique" ON "_StructureMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_StructureMedia_B_index" ON "_StructureMedia"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserMedia_AB_unique" ON "_UserMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_UserMedia_B_index" ON "_UserMedia"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TicketMedia_AB_unique" ON "_TicketMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_TicketMedia_B_index" ON "_TicketMedia"("B");

-- AddForeignKey
ALTER TABLE "_StructureMedia" ADD CONSTRAINT "_StructureMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StructureMedia" ADD CONSTRAINT "_StructureMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMedia" ADD CONSTRAINT "_UserMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMedia" ADD CONSTRAINT "_UserMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketMedia" ADD CONSTRAINT "_TicketMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketMedia" ADD CONSTRAINT "_TicketMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
