import { Package, TrendingDown, TrendingUp } from "lucide-react";
import type {
  ItemType,
  StockMovementRow,
  StockMovementType,
} from "~/types/stock-movement";

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

const MOVEMENT_META: Record<
  StockMovementType,
  {
    label: string;
    badgeClass: string;
    topBorderClass: string;
    icon: typeof TrendingUp;
    sign: "" | "+" | "-";
  }
> = {
  PURCHASE_IN: {
    label: "Pembelian Masuk",
    badgeClass: "bg-emerald-500 text-white",
    topBorderClass: "border-t-emerald-500",
    icon: TrendingUp,
    sign: "+",
  },
  SALE_OUT: {
    label: "Penjualan Keluar",
    badgeClass: "bg-rose-500 text-white",
    topBorderClass: "border-t-rose-500",
    icon: TrendingDown,
    sign: "-",
  },
  PRODUCTION_IN: {
    label: "Produksi Masuk",
    badgeClass: "bg-blue-500 text-white",
    topBorderClass: "border-t-blue-500",
    icon: TrendingUp,
    sign: "+",
  },
  PRODUCTION_OUT: {
    label: "Produksi Keluar",
    badgeClass: "bg-orange-500 text-white",
    topBorderClass: "border-t-orange-500",
    icon: TrendingDown,
    sign: "-",
  },
  RETURN_IN: {
    label: "Retur Masuk",
    badgeClass: "bg-purple-500 text-white",
    topBorderClass: "border-t-purple-500",
    icon: TrendingUp,
    sign: "+",
  },
  ADJUSTMENT: {
    label: "Penyesuaian",
    badgeClass: "bg-muted text-foreground",
    topBorderClass: "border-t-zinc-500",
    icon: Package,
    sign: "",
  },
};

export const movementTypeLabel = (t: StockMovementType) =>
  MOVEMENT_META[t].label;

export function badgeClassByType(t: StockMovementType) {
  return MOVEMENT_META[t].badgeClass;
}

export function topBorderByType(t: StockMovementType) {
  return MOVEMENT_META[t].topBorderClass;
}

export function getMovementIcon(t: StockMovementType) {
  return MOVEMENT_META[t].icon;
}

export function qtySign(t: StockMovementType) {
  return MOVEMENT_META[t].sign;
}

export const movementTypeBadge = (t: StockMovementType) => ({
  label: MOVEMENT_META[t].label,
  className: MOVEMENT_META[t].badgeClass,
});

export const getRefLabel = (m: StockMovementRow) => {
  if (m.refPurchase) return `PO: ${m.refPurchase.purchaseNo}`;
  if (m.refSale) return `SO: ${m.refSale.saleNo}`;
  if (m.refReturn) return `Return: ${m.refReturn.id.slice(0, 8)}`;
  if (m.refSemiFinishedGood) return `SFG: ${m.refSemiFinishedGood.name}`;
  if (m.refFinishedGood)
    return `FG: ${m.refFinishedGood.productionCode} • ${m.refFinishedGood.name}`;
  return "-";
};
