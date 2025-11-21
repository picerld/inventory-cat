import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
    minimumFractionDigits: 0,
  }).format(value);
};

export function generateRandomCode(prefix: string, length = 4) {
  const randomNumber = Math.floor(
    Math.random() * Math.pow(10, length)
  )
    .toString()
    .padStart(length, "0");

  return `${prefix}${randomNumber}`;
}

