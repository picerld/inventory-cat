/*
  Warnings:

  - Added the required column `qty` to the `SemiFinishedGoodDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SemiFinishedGoodDetail" ADD COLUMN     "qty" INTEGER NOT NULL;
