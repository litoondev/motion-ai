const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = process.env.API_URL || NEXT_PUBLIC_API_URL;

if (!NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

export const API_BASE_URL = API_URL!;
export const PUBLIC_API_BASE_URL = NEXT_PUBLIC_API_URL;

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

export function getPublicApiUrl(path: string): string {
  return `${PUBLIC_API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

export const STORAGE_BASE_URL = API_BASE_URL.replace('/api/v1', '/storage');
