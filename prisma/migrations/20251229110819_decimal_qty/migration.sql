/*
  Warnings:

  - You are about to alter the column `qty` on the `Buying` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `qty` on the `FinishedGood` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `qty` on the `FinishedGoodDetail` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `qty` on the `PaintAccessories` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `qty` on the `RawMaterial` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `qty` on the `ReturnedItem` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `qty` on the `Selling` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `qty` on the `SemiFinishedGood` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `qty` on the `SemiFinishedGoodDetail` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('RAW_MATERIAL', 'SEMI_FINISHED');

-- AlterTable
ALTER TABLE "Buying" ALTER COLUMN "qty" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "FinishedGood" ADD COLUMN     "sourceType" "SourceType" NOT NULL DEFAULT 'RAW_MATERIAL',
ALTER COLUMN "qty" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "FinishedGoodDetail" ADD COLUMN     "semiFinishedGoodId" TEXT,
ALTER COLUMN "qty" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PaintAccessories" ALTER COLUMN "qty" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "RawMaterial" ALTER COLUMN "qty" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "ReturnedItem" ALTER COLUMN "qty" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Selling" ALTER COLUMN "qty" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "SemiFinishedGood" ALTER COLUMN "qty" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "SemiFinishedGoodDetail" ALTER COLUMN "qty" SET DATA TYPE DECIMAL(10,2);

-- AddForeignKey
ALTER TABLE "FinishedGoodDetail" ADD CONSTRAINT "FinishedGoodDetail_semiFinishedGoodId_fkey" FOREIGN KEY ("semiFinishedGoodId") REFERENCES "SemiFinishedGood"("id") ON DELETE SET NULL ON UPDATE CASCADE;
