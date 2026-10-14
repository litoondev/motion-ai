import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a 40-char license key in format XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX */
export function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars (0/O, 1/I)
  const segments = 8;
  const segLen   = 5;
  const parts: string[] = [];

  for (let i = 0; i < segments; i++) {
    let seg = "";
    for (let j = 0; j < segLen; j++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(seg);
  }

  return parts.join("-"); // 40 chars + 7 hyphens
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

/** Calculate renewal price in USD */
export function calcPrice(seats: number, years: number): number {
  const basePerSeatYear = Number(process.env.NEXT_PUBLIC_PRICE_PER_SEAT_YEAR ?? 49);
  return seats * years * basePerSeatYear;
}

/** Hash a string with SHA-256 (for device fingerprints) */
export function hashDeviceId(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32);
}
