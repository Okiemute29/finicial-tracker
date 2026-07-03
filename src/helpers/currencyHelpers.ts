import type { CurrencyCode } from "../models/wealth/types";

export function formatCurrency(amount: number, currency: CurrencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatCompactCurrency(amount: number, currency: CurrencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function convertCurrency(amount: number, rate: number) {
  return Math.round((amount * rate + Number.EPSILON) * 100) / 100;
}
