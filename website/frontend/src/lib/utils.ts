import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date to "Jan 1, 2025" */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Days remaining until a date */
export function daysUntil(date: Date | string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

/** Check if a date is in the past */
export function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

/** Mask a license key for display: show first and last segment only */
export function maskLicenseKey(key: string): string {
  const parts = key.split("-");
  if (parts.length < 3) return key;
  return [parts[0], ...parts.slice(1, -1).map(() => "•••••"), parts[parts.length - 1]].join("-");
}

/** "49" / "49.00" / 49 -> "$49.00" */
export function formatMoney(amount: string | number, currency = "USD"): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return String(amount);
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

/** Only allow redirects to pages on this site (blocks open-redirect via ?callbackUrl=) */
export function safeCallbackUrl(raw: string | null | undefined, fallback = "/dashboard/"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}

/** "/dashboard/" -> "/dashboard" (usePathname keeps the trailing slash with trailingSlash: true) */
export function stripTrailingSlash(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}
