// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    // directUrl = env("DIRECT_URL")
}

enum ItemType {
    RAW_MATERIAL
    SEMI_FINISHED_GOOD
    FINISHED_GOOD
    PAINT_ACCESSORIES
}

enum SourceType {
    RAW_MATERIAL
    SEMI_FINISHED
}

model PaintGrade {
    id                String             @id @default(uuid())
    name              String
    description       String?
    createdAt         DateTime           @default(now())
    updatedAt         DateTime           @updatedAt
    rawMaterials      RawMaterial[]
    semiFinishedGoods SemiFinishedGood[]
    finishedGoods     FinishedGood[]
}

model Supplier {
    id               String             @id @default(uuid())
    name             String
    description      String?
    createdAt        DateTime           @default(now())
    updatedAt        DateTime           @updatedAt
    RawMaterial      RawMaterial[]
    paintAccessories PaintAccessories[]
}

model User {
    id               String             @id @default(uuid())
    name             String
    username         String
    password         String
    token            String?
    tokenExpiresAt   DateTime?
    createdAt        DateTime           @default(now())
    updatedAt        DateTime           @updatedAt
    RawMaterial      RawMaterial[]
    SemiFinishedGood SemiFinishedGood[]
    FinishedGood     FinishedGood[]
    PaintAccessories PaintAccessories[]
    returnedItems    ReturnedItem[]
}

model RawMaterial {
    id                     String                   @id @default(uuid())
    supplierId             String
    supplier               Supplier                 @relation(fields: [supplierId], references: [id])
    userId                 String
    user                   User                     @relation(fields: [userId], references: [id])
    name                   String
    qty                    Decimal                  @db.Decimal(10, 2)
    materialType           String // LEM, THINNER, DLL
    supplierPrice          Float
    createdAt              DateTime                 @default(now())
    updatedAt              DateTime                 @updatedAt
    SemiFinishedGoodDetail SemiFinishedGoodDetail[]
    finishedGoodDetails    FinishedGoodDetail[]
    paintGrade             PaintGrade?              @relation(fields: [paintGradeId], references: [id])
    paintGradeId           String?
}

model SemiFinishedGood {
    id                     String                   @id @default(uuid())
    userId                 String
    user                   User                     @relation(fields: [userId], references: [id])
    name                   String
    qty                    Decimal                  @db.Decimal(10, 2)
    paintGradeId           String
    paintGrade             PaintGrade               @relation(fields: [paintGradeId], references: [id])
    SemiFinishedGoodDetail SemiFinishedGoodDetail[]
    finishedGoodDetails    FinishedGoodDetail[]
    createdAt              DateTime                 @default(now())
    updatedAt              DateTime                 @updatedAt
}

model SemiFinishedGoodDetail {
    id                 String           @id @default(uuid())
    semiFinishedGoodId String
    semiFinishedGood   SemiFinishedGood @relation(fields: [semiFinishedGoodId], references: [id])
    rawMaterialId      String
    rawMaterial        RawMaterial      @relation(fields: [rawMaterialId], references: [id])
    qty                Decimal          @db.Decimal(10, 2)
    createdAt          DateTime         @default(now())
    updatedAt          DateTime         @updatedAt
}

model FinishedGood {
    id                  String               @id @default(uuid())
    productionCode      String               @unique
    name                String
    qty                 Decimal              @db.Decimal(10, 2)
    batchNumber         String
    sourceType          SourceType           @default(RAW_MATERIAL)
    dateProduced        DateTime             @default(now())
    userId              String
    user                User                 @relation(fields: [userId], references: [id])
    paintGradeId        String
    paintGrade          PaintGrade           @relation(fields: [paintGradeId], references: [id])
    finishedGoodDetails FinishedGoodDetail[]
    returnedItems       ReturnedItem[]
    createdAt           DateTime             @default(now())
    updatedAt           DateTime             @updatedAt
}

model FinishedGoodDetail {
    id                 String            @id @default(uuid())
    finishedGoodId     String
    finishedGood       FinishedGood      @relation(fields: [finishedGoodId], references: [id])
    rawMaterialId      String
    rawMaterial        RawMaterial       @relation(fields: [rawMaterialId], references: [id])
    qty                Decimal           @db.Decimal(10, 2)
    createdAt          DateTime          @default(now())
    updatedAt          DateTime          @updatedAt
    semiFinishedGood   SemiFinishedGood? @relation(fields: [semiFinishedGoodId], references: [id])
    semiFinishedGoodId String?
}

model PaintAccessories {
    id            String   @id @default(uuid())
    name          String
    supplierId    String
    supplier      Supplier @relation(fields: [supplierId], references: [id])
    userId        String
    user          User     @relation(fields: [userId], references: [id])
    supplierPrice Float
    sellingPrice  Float
    qty           Decimal  @db.Decimal(10, 2)
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
}

model ReturnedItem {
    id             String       @id @default(uuid())
    // itemType    ItemType
    userId         String
    user           User         @relation(fields: [userId], references: [id])
    finishedGoodId String
    finishedGood   FinishedGood @relation(fields: [finishedGoodId], references: [id])
    qty            Decimal      @db.Decimal(10, 2)
    from           String
    description    String?
    createdAt      DateTime     @default(now())
    updatedAt      DateTime     @updatedAt
}

model Selling {
    id        String   @id @default(uuid())
    qty       Decimal  @db.Decimal(10, 2)
    itemType  ItemType
    itemId    String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model Buying {
    id        String   @id @default(uuid())
    qty       Decimal  @db.Decimal(10, 2)
    itemType  ItemType
    itemId    String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
