export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1"
).replace(/\/+$/, "");

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
