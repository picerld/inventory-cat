/*
  Warnings:

  - Added the required column `paintGradeId` to the `RawMaterial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `SemiFinishedGood` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN     "paintGradeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SemiFinishedGood" ADD COLUMN     "qty" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "PaintGrade" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaintGrade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_paintGradeId_fkey" FOREIGN KEY ("paintGradeId") REFERENCES "PaintGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
