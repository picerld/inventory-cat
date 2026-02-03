/*
  Warnings:

  - You are about to drop the `Buying` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Selling` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('DRAFT', 'ONGOING', 'FINISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('DRAFT', 'ONGOING', 'FINISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PurchaseItemType" AS ENUM ('RAW_MATERIAL', 'PAINT_ACCESSORIES');

-- CreateEnum
CREATE TYPE "SaleItemType" AS ENUM ('FINISHED_GOOD', 'PAINT_ACCESSORIES');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE_IN', 'SALE_OUT', 'PRODUCTION_IN', 'PRODUCTION_OUT', 'RETURN_IN', 'ADJUSTMENT');

-- DropForeignKey
ALTER TABLE "FinishedGood" DROP CONSTRAINT "FinishedGood_paintGradeId_fkey";

-- DropForeignKey
ALTER TABLE "FinishedGood" DROP CONSTRAINT "FinishedGood_userId_fkey";

-- DropForeignKey
ALTER TABLE "FinishedGoodDetail" DROP CONSTRAINT "FinishedGoodDetail_finishedGoodId_fkey";

-- DropForeignKey
ALTER TABLE "FinishedGoodDetail" DROP CONSTRAINT "FinishedGoodDetail_rawMaterialId_fkey";

-- DropForeignKey
ALTER TABLE "PaintAccessories" DROP CONSTRAINT "PaintAccessories_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PaintAccessories" DROP CONSTRAINT "PaintAccessories_userId_fkey";

-- DropForeignKey
ALTER TABLE "RawMaterial" DROP CONSTRAINT "RawMaterial_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "RawMaterial" DROP CONSTRAINT "RawMaterial_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReturnedItem" DROP CONSTRAINT "ReturnedItem_finishedGoodId_fkey";

-- DropForeignKey
ALTER TABLE "ReturnedItem" DROP CONSTRAINT "ReturnedItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "SemiFinishedGood" DROP CONSTRAINT "SemiFinishedGood_paintGradeId_fkey";

-- DropForeignKey
ALTER TABLE "SemiFinishedGood" DROP CONSTRAINT "SemiFinishedGood_userId_fkey";

-- DropForeignKey
ALTER TABLE "SemiFinishedGoodDetail" DROP CONSTRAINT "SemiFinishedGoodDetail_rawMaterialId_fkey";

-- DropForeignKey
ALTER TABLE "SemiFinishedGoodDetail" DROP CONSTRAINT "SemiFinishedGoodDetail_semiFinishedGoodId_fkey";

-- DropTable
DROP TABLE "Buying";

-- DropTable
DROP TABLE "Selling";

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "purchaseNo" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "receivedNote" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "itemType" "PurchaseItemType" NOT NULL,
    "rawMaterialId" TEXT,
    "accessoryId" TEXT,
    "qty" DECIMAL(10,2) NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "saleNo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderNo" TEXT,
    "invoiceNo" TEXT,
    "shippedAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SaleStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "itemType" "SaleItemType" NOT NULL,
    "finishedGoodId" TEXT,
    "accessoryId" TEXT,
    "qty" DECIMAL(10,2) NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" DECIMAL(10,2) NOT NULL,
    "refPurchaseId" TEXT,
    "refSaleId" TEXT,
    "refReturnId" TEXT,
    "refSemiFinishedGoodId" TEXT,
    "refFinishedGoodId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_purchaseNo_key" ON "Purchase"("purchaseNo");

-- CreateIndex
CREATE INDEX "Purchase_supplierId_idx" ON "Purchase"("supplierId");

-- CreateIndex
CREATE INDEX "Purchase_purchasedAt_idx" ON "Purchase"("purchasedAt");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseId_idx" ON "PurchaseItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseItem_rawMaterialId_idx" ON "PurchaseItem"("rawMaterialId");

-- CreateIndex
CREATE INDEX "PurchaseItem_accessoryId_idx" ON "PurchaseItem"("accessoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_saleNo_key" ON "Sale"("saleNo");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_invoiceNo_key" ON "Sale"("invoiceNo");

-- CreateIndex
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");

-- CreateIndex
CREATE INDEX "Sale_soldAt_idx" ON "Sale"("soldAt");

-- CreateIndex
CREATE INDEX "Sale_status_idx" ON "Sale"("status");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");

-- CreateIndex
CREATE INDEX "SaleItem_finishedGoodId_idx" ON "SaleItem"("finishedGoodId");

-- CreateIndex
CREATE INDEX "SaleItem_accessoryId_idx" ON "SaleItem"("accessoryId");

-- CreateIndex
CREATE INDEX "StockMovement_itemType_itemId_idx" ON "StockMovement"("itemType", "itemId");

-- CreateIndex
CREATE INDEX "StockMovement_refPurchaseId_idx" ON "StockMovement"("refPurchaseId");

-- CreateIndex
CREATE INDEX "StockMovement_refSaleId_idx" ON "StockMovement"("refSaleId");

-- CreateIndex
CREATE INDEX "StockMovement_refReturnId_idx" ON "StockMovement"("refReturnId");

-- CreateIndex
CREATE INDEX "StockMovement_refSemiFinishedGoodId_idx" ON "StockMovement"("refSemiFinishedGoodId");

-- CreateIndex
CREATE INDEX "StockMovement_refFinishedGoodId_idx" ON "StockMovement"("refFinishedGoodId");

-- CreateIndex
CREATE INDEX "FinishedGood_paintGradeId_idx" ON "FinishedGood"("paintGradeId");

-- CreateIndex
CREATE INDEX "FinishedGoodDetail_finishedGoodId_idx" ON "FinishedGoodDetail"("finishedGoodId");

-- CreateIndex
CREATE INDEX "FinishedGoodDetail_rawMaterialId_idx" ON "FinishedGoodDetail"("rawMaterialId");

-- CreateIndex
CREATE INDEX "FinishedGoodDetail_semiFinishedGoodId_idx" ON "FinishedGoodDetail"("semiFinishedGoodId");

-- CreateIndex
CREATE INDEX "PaintAccessories_supplierId_idx" ON "PaintAccessories"("supplierId");

-- CreateIndex
CREATE INDEX "RawMaterial_supplierId_idx" ON "RawMaterial"("supplierId");

-- CreateIndex
CREATE INDEX "ReturnedItem_finishedGoodId_idx" ON "ReturnedItem"("finishedGoodId");

-- CreateIndex
CREATE INDEX "SemiFinishedGood_paintGradeId_idx" ON "SemiFinishedGood"("paintGradeId");

-- CreateIndex
CREATE INDEX "SemiFinishedGoodDetail_semiFinishedGoodId_idx" ON "SemiFinishedGoodDetail"("semiFinishedGoodId");

-- CreateIndex
CREATE INDEX "SemiFinishedGoodDetail_rawMaterialId_idx" ON "SemiFinishedGoodDetail"("rawMaterialId");

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemiFinishedGood" ADD CONSTRAINT "SemiFinishedGood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemiFinishedGood" ADD CONSTRAINT "SemiFinishedGood_paintGradeId_fkey" FOREIGN KEY ("paintGradeId") REFERENCES "PaintGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemiFinishedGoodDetail" ADD CONSTRAINT "SemiFinishedGoodDetail_semiFinishedGoodId_fkey" FOREIGN KEY ("semiFinishedGoodId") REFERENCES "SemiFinishedGood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemiFinishedGoodDetail" ADD CONSTRAINT "SemiFinishedGoodDetail_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGood" ADD CONSTRAINT "FinishedGood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGood" ADD CONSTRAINT "FinishedGood_paintGradeId_fkey" FOREIGN KEY ("paintGradeId") REFERENCES "PaintGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGoodDetail" ADD CONSTRAINT "FinishedGoodDetail_finishedGoodId_fkey" FOREIGN KEY ("finishedGoodId") REFERENCES "FinishedGood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGoodDetail" ADD CONSTRAINT "FinishedGoodDetail_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaintAccessories" ADD CONSTRAINT "PaintAccessories_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaintAccessories" ADD CONSTRAINT "PaintAccessories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnedItem" ADD CONSTRAINT "ReturnedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnedItem" ADD CONSTRAINT "ReturnedItem_finishedGoodId_fkey" FOREIGN KEY ("finishedGoodId") REFERENCES "FinishedGood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "PaintAccessories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_finishedGoodId_fkey" FOREIGN KEY ("finishedGoodId") REFERENCES "FinishedGood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "PaintAccessories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_refPurchaseId_fkey" FOREIGN KEY ("refPurchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_refSaleId_fkey" FOREIGN KEY ("refSaleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_refReturnId_fkey" FOREIGN KEY ("refReturnId") REFERENCES "ReturnedItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_refSemiFinishedGoodId_fkey" FOREIGN KEY ("refSemiFinishedGoodId") REFERENCES "SemiFinishedGood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_refFinishedGoodId_fkey" FOREIGN KEY ("refFinishedGoodId") REFERENCES "FinishedGood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
