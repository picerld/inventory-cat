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

export function badgeClassByType(t: StockMovementType) {
  switch (t) {
    case "PURCHASE_IN":
    case "PRODUCTION_IN":
    case "RETURN_IN":
      return "bg-emerald-500 text-white";
    case "SALE_OUT":
    case "PRODUCTION_OUT":
      return "bg-rose-500 text-white";
    case "ADJUSTMENT":
      return "bg-muted text-foreground";
  }
}

export function topBorderByType(type: string) {
  switch (type) {
    case "PURCHASE_IN":
      return "border-t-emerald-500";
    case "SALE_OUT":
      return "border-t-rose-500";
    case "PRODUCTION_IN":
      return "border-t-blue-500";
    case "PRODUCTION_OUT":
      return "border-t-orange-500";
    case "RETURN_IN":
      return "border-t-purple-500";
    case "ADJUSTMENT":
      return "border-t-zinc-500";
    default:
      return "border-t-border";
  }
}

export const movementTypeBadge = (t: StockMovementType) => {
  switch (t) {
    case "PURCHASE_IN":
      return {
        label: "Pembelian Masuk",
        className: "bg-emerald-500 text-white",
      };
    case "SALE_OUT":
      return {
        label: "Penjualan Keluar",
        className: "bg-rose-500 text-white",
      };
    case "PRODUCTION_IN":
      return {
        label: "Produksi Masuk",
        className: "bg-blue-500 text-white",
      };
    case "PRODUCTION_OUT":
      return {
        label: "Produksi Keluar",
        className: "bg-orange-500 text-white",
      };
    case "RETURN_IN":
      return {
        label: "Retur Masuk",
        className: "bg-purple-500 text-white",
      };
    case "ADJUSTMENT":
      return {
        label: "Penyesuaian",
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
