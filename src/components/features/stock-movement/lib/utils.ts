import type { ItemType, StockMovementRow, StockMovementType } from "~/types/stock-movement";

export const toNumber = (v: unknown) => {
  const n = Number(v as any);
  return Number.isFinite(n) ? n : 0;
};

export const formatQty = (qty: unknown) =>
  toNumber(qty).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

export const itemTypeLabel = (t: ItemType) => {
  switch (t) {
    case "RAW_MATERIAL":
      return "Bahan Baku";
    case "SEMI_FINISHED_GOOD":
      return "Barang Setengah Jadi";
    case "FINISHED_GOOD":
      return "Barang Jadi";
    case "PAINT_ACCESSORIES":
      return "Aksesoris";
  }
};

export const movementTypeLabel = (t: StockMovementType) => {
  switch (t) {
    case "PURCHASE_IN":
      return "Pembelian Masuk";
    case "SALE_OUT":
      return "Penjualan Keluar";
    case "PRODUCTION_IN":
      return "Produksi Masuk";
    case "PRODUCTION_OUT":
      return "Produksi Keluar";
    case "RETURN_IN":
      return "Retur Masuk";
    case "ADJUSTMENT":
      return "Penyesuaian";
  }
};

export const movementTypeBadge = (t: StockMovementType) => {
  switch (t) {
    case "PURCHASE_IN":
      return {
        label: "Purchase In",
        className: "bg-emerald-500 text-white",
      };
    case "SALE_OUT":
      return {
        label: "Sale Out",
        className: "bg-rose-500 text-white",
      };
    case "PRODUCTION_IN":
      return {
        label: "Production In",
        className: "bg-blue-500 text-white",
      };
    case "PRODUCTION_OUT":
      return {
        label: "Production Out",
        className: "bg-orange-500 text-white",
      };
    case "RETURN_IN":
      return {
        label: "Return In",
        className: "bg-purple-500 text-white",
      };
    case "ADJUSTMENT":
      return {
        label: "Adjustment",
        className: "bg-muted text-foreground",
      };
  }
};

export const getRefLabel = (m: StockMovementRow) => {
  if (m.refPurchase) return `PO: ${m.refPurchase.purchaseNo}`;
  if (m.refSale) return `SO: ${m.refSale.saleNo}`;
  if (m.refReturn) return `Return: ${m.refReturn.id.slice(0, 8)}`;
  if (m.refSemiFinishedGood) return `SFG: ${m.refSemiFinishedGood.name}`;
  if (m.refFinishedGood)
    return `FG: ${m.refFinishedGood.productionCode} • ${m.refFinishedGood.name}`;
  return "-";
};
