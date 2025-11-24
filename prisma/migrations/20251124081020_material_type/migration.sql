/*
  Warnings:

  - Added the required column `materialType` to the `RawMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN     "materialType" TEXT NOT NULL;
