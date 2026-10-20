/**
 * All values come from NEXT_PUBLIC_* variables and are inlined at build time.
 * NOTE: Next.js only inlines `process.env.NEXT_PUBLIC_X` written out literally.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1"
).replace(/\/+$/, "");

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "0devdesign.studio@gmail.com";

export const BANK_DETAILS = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || "",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "",
  branch: process.env.NEXT_PUBLIC_BANK_BRANCH || "",
  swift: process.env.NEXT_PUBLIC_BANK_SWIFT || "",
};

export const BANK_TRANSFER_ENABLED = Boolean(BANK_DETAILS.accountNumber);

export const BKASH_DETAILS = {
  number: process.env.NEXT_PUBLIC_BKASH_NUMBER || "",
  type: process.env.NEXT_PUBLIC_BKASH_TYPE || "Merchant",
};

export const BKASH_ENABLED = Boolean(BKASH_DETAILS.number);

export const PAYONEER_DETAILS = {
  email: process.env.NEXT_PUBLIC_PAYONEER_EMAIL || "",
};

export const PAYONEER_ENABLED = Boolean(PAYONEER_DETAILS.email);

export const WISE_DETAILS = {
  email: process.env.NEXT_PUBLIC_WISE_EMAIL || "",
};

export const WISE_ENABLED = Boolean(WISE_DETAILS.email);

export const PLUGIN_FILENAME = "motion-ai-plugin.zip";
