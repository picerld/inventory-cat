import type { User } from "./user";

export type ItemType =
  | "RAW_MATERIAL"
  | "SEMI_FINISHED_GOOD"
  | "FINISHED_GOOD"
  | "PAINT_ACCESSORIES";

export type StockMovementType =
  | "PURCHASE_IN"
  | "SALE_OUT"
  | "PRODUCTION_IN"
  | "PRODUCTION_OUT"
  | "RETURN_IN"
  | "ADJUSTMENT";

export type StockMovementRefPurchase = { id: string; purchaseNo: string };
export type StockMovementRefSale = { id: string; saleNo: string };
export type StockMovementRefReturn = { id: string };

export type StockMovementRefSemiFinished = { id: string; name: string };
export type StockMovementRefFinished = {
  id: string;
  name: string;
  productionCode: string;
};

export type StockMovementRow = {
  id: string;
  type: StockMovementType;
  itemType: ItemType;
  itemId: string;

  qty: string | number; // prisma decimal can be string
  createdAt: string | Date;

  refPurchaseId?: string | null;
  refSaleId?: string | null;
  refReturnId?: string | null;

  refSemiFinishedGoodId?: string | null;
  refFinishedGoodId?: string | null;

  user: User;

  // included by router
  refPurchase?: StockMovementRefPurchase | null;
  refSale?: StockMovementRefSale | null;
  refReturn?: StockMovementRefReturn | null;

  refSemiFinishedGood?: StockMovementRefSemiFinished | null;
  refFinishedGood?: StockMovementRefFinished | null;
};

export type StockMovementMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  totalItems: number;
};

export type StockMovementPaginated = {
  data: StockMovementRow[];
  meta: StockMovementMeta;
};
