export type SaleStatus = "DRAFT" | "ONGOING" | "FINISHED" | "CANCELED";
export type StatusFilter = SaleStatus | "ALL";

export type SaleAccessoriesItem = {
  id: string;
  itemType: "PAINT_ACCESSORIES";
  accessoryId: string;
  qty: number | string;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

export type SaleFinishedGoodItem = {
  id: string;
  itemType: "FINISHED_GOOD";
  finishedGoodId: string;
  qty: number | string;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
};

export type SaleAccessoriesFull = {
  id: string;
  saleNo: string;
  customerId: string;
  orderNo: string | null;
  invoiceNo: string | null;
  notes: string | null;
  status: "DRAFT" | "ONGOING" | "FINISHED" | "CANCELED";
  customer: { name: string; phone?: string | null; address?: string | null };
  items: SaleAccessoriesItem[];
}

export type SaleFinishedGoodFull = {
  id: string;
  saleNo: string;
  customerId: string;
  orderNo: string | null;
  invoiceNo: string | null;
  notes: string | null;
  status: "DRAFT" | "ONGOING" | "FINISHED" | "CANCELED";
  customer: { name: string; phone?: string | null; address?: string | null };
  items: SaleFinishedGoodItem[];
};
