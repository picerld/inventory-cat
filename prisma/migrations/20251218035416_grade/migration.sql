/*
  Warnings:

  - You are about to drop the column `quality` on the `FinishedGood` table. All the data in the column will be lost.
  - You are about to drop the column `sellingPrice` on the `RawMaterial` table. All the data in the column will be lost.
  - Added the required column `paintGradeId` to the `FinishedGood` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paintGradeId` to the `SemiFinishedGood` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RawMaterial" DROP CONSTRAINT "RawMaterial_paintGradeId_fkey";

-- AlterTable
ALTER TABLE "FinishedGood" DROP COLUMN "quality",
ADD COLUMN     "paintGradeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RawMaterial" DROP COLUMN "sellingPrice",
ALTER COLUMN "paintGradeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SemiFinishedGood" ADD COLUMN     "paintGradeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_paintGradeId_fkey" FOREIGN KEY ("paintGradeId") REFERENCES "PaintGrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemiFinishedGood" ADD CONSTRAINT "SemiFinishedGood_paintGradeId_fkey" FOREIGN KEY ("paintGradeId") REFERENCES "PaintGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGood" ADD CONSTRAINT "FinishedGood_paintGradeId_fkey" FOREIGN KEY ("paintGradeId") REFERENCES "PaintGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
