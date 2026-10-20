import { API_BASE_URL } from "@/lib/config";

export { API_BASE_URL };
export const PUBLIC_API_BASE_URL = API_BASE_URL;

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

export function getPublicApiUrl(path: string): string {
  return `${PUBLIC_API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}
