import { getPublicApiUrl } from "@/config/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((customHeaders as Record<string, string>) ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = getPublicApiUrl(path);
  const res = await fetch(url, { ...rest, headers });

  if (!res.ok) {
    let data: Record<string, unknown> = {};
    try {
      data = await res.json();
    } catch {
      // ignore parse error
    }

    if (res.status === 401) {
      // Clear cookie on 401 — handled by middleware redirect
      if (typeof window !== "undefined") {
        document.cookie = "admin_auth_token=; path=/; max-age=0";
        window.location.href = "/login";
      }
    }

    throw new ApiError(
      (data.message as string) ?? (data.error as string) ?? `Request failed (${res.status})`,
      res.status,
      data
    );
  }

  const json = await res.json();
  // Handle envelope: { data: T } or just T
  return (json.data !== undefined ? json.data : json) as T;
}

/** Upload a file via FormData */
export async function apiUpload<T>(path: string, formData: FormData, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = getPublicApiUrl(path);
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let data: Record<string, unknown> = {};
    try {
      data = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(
      (data.message as string) ?? `Upload failed (${res.status})`,
      res.status,
      data
    );
  }

  const json = await res.json();
  return (json.data !== undefined ? json.data : json) as T;
}
