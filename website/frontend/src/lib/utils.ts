import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date to "Jan 1, 2025" */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  });
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
  return [parts[0], "•••••", "•••••", "•••••", "•••••", "•••••", "•••••", parts[parts.length - 1]].join("-");
}
