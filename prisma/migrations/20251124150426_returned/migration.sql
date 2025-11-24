/*
  Warnings:

  - You are about to drop the column `itemId` on the `ReturnedItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemType` on the `ReturnedItem` table. All the data in the column will be lost.
  - Added the required column `finishedGoodId` to the `ReturnedItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from` to the `ReturnedItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReturnedItem" DROP COLUMN "itemId",
DROP COLUMN "itemType",
ADD COLUMN     "finishedGoodId" TEXT NOT NULL,
ADD COLUMN     "from" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ReturnedItem" ADD CONSTRAINT "ReturnedItem_finishedGoodId_fkey" FOREIGN KEY ("finishedGoodId") REFERENCES "FinishedGood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
