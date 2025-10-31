/*
  Warnings:

  - The values [IMN,SEGARIS] on the enum `ItemType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `SemiFinishedGood` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SemiFinishedGoodDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ItemType_new" AS ENUM ('RAW_MATERIAL', 'SEMI_FINISHED_GOOD', 'FINISHED_GOOD', 'PAINT_ACCESSORIES');
ALTER TABLE "ReturnedItem" ALTER COLUMN "itemType" TYPE "ItemType_new" USING ("itemType"::text::"ItemType_new");
ALTER TABLE "Selling" ALTER COLUMN "itemType" TYPE "ItemType_new" USING ("itemType"::text::"ItemType_new");
ALTER TABLE "Buying" ALTER COLUMN "itemType" TYPE "ItemType_new" USING ("itemType"::text::"ItemType_new");
ALTER TYPE "ItemType" RENAME TO "ItemType_old";
ALTER TYPE "ItemType_new" RENAME TO "ItemType";
DROP TYPE "public"."ItemType_old";
COMMIT;

-- AlterTable
ALTER TABLE "SemiFinishedGood" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SemiFinishedGoodDetail" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
