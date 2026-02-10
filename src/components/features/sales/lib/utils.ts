import { toNumber } from "~/lib/utils";
import type { Line, LineAccessories } from "../finished-good/types/forms";
import type { SaleStatus } from "~/types/sale";

export const getStatusConfig = (status?: SaleStatus) => {
  const configs = {
    DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700" },
    ONGOING: { label: "Ongoing", className: "bg-blue-100 text-blue-700" },
    FINISHED: {
      label: "Finished",
      className: "bg-emerald-100 text-emerald-700",
    },
    CANCELED: { label: "Canceled", className: "bg-red-100 text-red-700" },
  };
  return status ? configs[status] : null;
};

export function generateInvoiceNo(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${y}${m}-${rand}`;
}

export function computeSummary(lines: Line[]) {
  const totalCost = lines.reduce(
    (acc, it) => acc + toNumber(it.qty) * Number(it.costPrice ?? 0),
    0,
  );

  const revenue = lines.reduce(
    (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
    0,
  );

  const profit = revenue - totalCost;
  const marginPct = totalCost ? (profit / totalCost) * 100 : 0;

  const totalUnits = lines.reduce((acc, it) => acc + toNumber(it.qty), 0);

  return {
    totalLines: lines.length,
    totalUnits,
    totalCost,
    revenue,
    profit,
    marginPct,
  };
}

export function computeSummaryAccessories(lines: LineAccessories[]) {
  const totalCost = lines.reduce(
    (acc, it) => acc + toNumber(it.qty) * Number(it.costPrice ?? 0),
    0,
  );

  const revenue = lines.reduce(
    (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
    0,
  );

  const profit = revenue - totalCost;
  const marginPct = totalCost ? (profit / totalCost) * 100 : 0;

  const totalUnits = lines.reduce((acc, it) => acc + toNumber(it.qty), 0);

  return {
    totalLines: lines.length,
    totalUnits,
    totalCost,
    revenue,
    profit,
    marginPct,
  };
}
