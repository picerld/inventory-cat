import type { PurchaseStatus } from "~/components/features/purchases/config/purchase";
import type { RawMaterial } from "./raw-material";
import type { User } from "./user";
import type { Supplier } from "./supplier";
import type { PaintAccessories } from "@prisma/client";

export type PurchaseRawMaterial = {
  id: string;
  purchaseNo: string;
  supplierId: string;
  receivedNote?: string | null;
  notes?: string | null;
  status: PurchaseStatus;
  purchasedAt: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PurchaseRawMaterialItem = {
  id: string;
  purchaseId: string;
  rawMaterialId: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
  rawMaterial?: RawMaterial;
};


export type PurchaseRawMaterialFull = {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplier: Supplier;
  userId: string;
  user: User;
  status: PurchaseStatus;
  receivedNote?: string | null;
  notes?: string | null;
  purchasedAt: Date;
  items: PurchaseRawMaterialItem[];
  summary?: {
    totalQty: number;
    totalAmount: number;
    totalItemsLine?: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

// ACCESSORIES PURCHASE TYPES

export type PurchaseAccessories = {
  id: string;
  purchaseNo: string;
  supplierId: string;
  receivedNote?: string | null;
  notes?: string | null;
  status: PurchaseStatus;
  purchasedAt: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PurchaseAccessoriesItem = {
  id: string;
  purchaseId: string;
  accessoryId: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
  accessory?: PaintAccessories;
};

export type PurchaseAccessoriesFull = {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplier: Supplier;
  userId: string;
  user: User;
  status: PurchaseStatus;
  receivedNote?: string | null;
  notes?: string | null;
  purchasedAt: Date;
  items: PurchaseAccessoriesItem[];
  summary?: {
    totalQty: number;
    totalAmount: number;
    totalItemsLine?: number;
  };
  createdAt: Date;
  updatedAt: Date;
};