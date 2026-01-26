import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PurchaseStatus } from "~/components/features/purchases/config/purchase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const formatPrice = (value: number) => {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID").format(value);
};

export const toRupiah = (value: number) => {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

export const toNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function generateRandomCode(prefix: string, length = 4) {
  const randomNumber = Math.floor(
    Math.random() * Math.pow(10, length)
  )
    .toString()
    .padStart(length, "0");

  return `${prefix}${randomNumber}`;
}

export function statusBadge(status: PurchaseStatus) {
  const map: Record<PurchaseStatus, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-muted text-foreground" },
    ONGOING: { label: "Ongoing", className: "bg-sky-500 text-white" },
    FINISHED: { label: "Finished", className: "bg-emerald-500 text-white" },
    CANCELED: { label: "Canceled", className: "bg-destructive text-white" },
  };

  return map[status];
}
