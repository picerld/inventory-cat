/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('IMN', 'SEGARIS');

-- DropTable
DROP TABLE "public"."Post";

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "supplierPrice" DOUBLE PRECISION NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemiFinishedGood" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SemiFinishedGood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemiFinishedGoodDetail" (
    "id" TEXT NOT NULL,
    "semiFinishedGoodId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,

    CONSTRAINT "SemiFinishedGoodDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishedGood" (
    "id" TEXT NOT NULL,
    "productionCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateProduced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batchNumber" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinishedGood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaintAccessories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "supplierPrice" DOUBLE PRECISION NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "qty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaintAccessories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnedItem" (
    "id" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Selling" (
    "id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Selling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buying" (
    "id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buying_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinishedGood_productionCode_key" ON "FinishedGood"("productionCode");

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemiFinishedGood" ADD CONSTRAINT "SemiFinishedGood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemiFinishedGoodDetail" ADD CONSTRAINT "SemiFinishedGoodDetail_semiFinishedGoodId_fkey" FOREIGN KEY ("semiFinishedGoodId") REFERENCES "SemiFinishedGood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemiFinishedGoodDetail" ADD CONSTRAINT "SemiFinishedGoodDetail_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGood" ADD CONSTRAINT "FinishedGood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaintAccessories" ADD CONSTRAINT "PaintAccessories_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaintAccessories" ADD CONSTRAINT "PaintAccessories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
