/*
  Warnings:

  - Added the required column `rawMaterialId` to the `FinishedGoodDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinishedGoodDetail" ADD COLUMN     "rawMaterialId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FinishedGoodDetail" ADD CONSTRAINT "FinishedGoodDetail_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
