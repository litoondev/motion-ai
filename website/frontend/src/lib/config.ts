/**
 * All values come from NEXT_PUBLIC_* variables and are inlined at build time.
 * NOTE: Next.js only inlines `process.env.NEXT_PUBLIC_X` written out literally.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1"
).replace(/\/+$/, "");

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "design@orangetoolz.com";

export const BANK_DETAILS = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || "",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "",
  swift: process.env.NEXT_PUBLIC_BANK_SWIFT || "",
};

export const BANK_TRANSFER_ENABLED = Boolean(BANK_DETAILS.accountNumber);

export const PLUGIN_FILENAME = "motion-ai-plugin.zip";
