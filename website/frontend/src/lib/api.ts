import { getApiUrl } from '@/config/api';
import { cookies } from 'next/headers';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
  }
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const authToken = token || await getAuthToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const url = getApiUrl(path);
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    throw new ApiError(401, 'Unauthorized');
  }

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new ApiError(
      response.status,
      json.message || 'An error occurred',
      json.errors || undefined
    );
  }

  return json.data;
}

async function getAuthToken(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') {
      const cookieStore = await cookies();
      return cookieStore.get('auth_token')?.value || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function clientApiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const { getPublicApiUrl } = await import('@/config/api');
  const url = getPublicApiUrl(path);

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new ApiError(
      response.status,
      json.message || 'An error occurred',
      json.errors || undefined
    );
  }

  return json.data;
}
