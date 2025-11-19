/*
  Warnings:

  - Added the required column `name` to the `RawMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN     "name" TEXT NOT NULL;
