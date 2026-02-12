import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PurchaseStatus } from "~/components/features/purchases/config/purchase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const round = (n: number, dp = 2) => {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
};

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

export const formatRupiah = (value?: number | string) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return "Rp" + n.toLocaleString("id-ID");
};

export const parseRupiah = (value: string) => {
  return Number(value.replace(/^Rp\s?/, "").replace(/\D/g, ""));
};

export function formatDateID(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export const toNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function generateRandomCode(prefix: string, length = 4) {
  const randomNumber = Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");

  return `${prefix}${randomNumber}`;
}

export function statusBadge(status: PurchaseStatus) {
  const map: Record<PurchaseStatus, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-muted text-foreground" },
    ONGOING: { label: "Ongoing", className: "bg-blue-700 text-white" },
    FINISHED: { label: "Finished", className: "bg-emerald-500 text-white" },
    CANCELED: { label: "Canceled", className: "bg-destructive text-white" },
  };

  return map[status];
}

export function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
