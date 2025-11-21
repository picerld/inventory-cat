/*
  Warnings:

  - Added the required column `qty` to the `FinishedGood` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinishedGood" ADD COLUMN     "qty" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "FinishedGoodDetail" (
    "id" TEXT NOT NULL,
    "finishedGoodId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinishedGoodDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FinishedGoodDetail" ADD CONSTRAINT "FinishedGoodDetail_finishedGoodId_fkey" FOREIGN KEY ("finishedGoodId") REFERENCES "FinishedGood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
