import { API_BASE_URL, PLUGIN_FILENAME } from "@/lib/config";
import { clearToken, getToken, UNAUTHORIZED_EVENT } from "@/lib/token";
import type { FieldErrors } from "@/lib/types";

/** Laravel envelope: { success, message, data, errors } */
interface Envelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: FieldErrors | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: FieldErrors | null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** plain object -> JSON, FormData -> multipart */
  body?: unknown;
  /** send the Bearer token (default true when a token exists) */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildHeaders(opts: RequestOptions): Headers {
  const headers = new Headers({ Accept: "application/json" });
  if (opts.body !== undefined && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = opts.auth === false ? null : getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function buildBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  return body instanceof FormData ? body : JSON.stringify(body);
}

function handleUnauthorized(hadToken: boolean) {
  if (hadToken && typeof window !== "undefined") {
    clearToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
}

async function send(path: string, opts: RequestOptions): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method: opts.method ?? "GET",
      headers: buildHeaders(opts),
      body: buildBody(opts.body),
      signal: opts.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }
}

export async function apiFetch<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const hadToken = opts.auth !== false && Boolean(getToken());
  const response = await send(path, opts);

  // The API can answer with HTML (e.g. a proxy error page), so never assume JSON.
  const text = await response.text();
  let json: Envelope<T> | null = null;
  try {
    json = text ? (JSON.parse(text) as Envelope<T>) : null;
  } catch {
    json = null;
  }

  if (response.status === 401) handleUnauthorized(hadToken);

  if (!response.ok || !json || json.success === false) {
    throw new ApiError(
      response.status,
      json?.message || `Request failed (${response.status}).`,
      json?.errors ?? null
    );
  }

  return json.data as T;
}

/** Downloads the plugin zip through fetch (the endpoint needs the Bearer token). */
export async function downloadPluginFile(path: string): Promise<void> {
  const hadToken = Boolean(getToken());
  const response = await send(path, {});

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized(hadToken);
    let message = `Download failed (${response.status}).`;
    try {
      const json = (await response.json()) as Envelope<unknown>;
      if (json.message) message = json.message;
    } catch {
      /* keep default message */
    }
    throw new ApiError(response.status, message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = PLUGIN_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** First validation message if there is one, otherwise the error message. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) {
    const first = err.errors ? Object.values(err.errors).flat()[0] : undefined;
    return first || err.message || fallback;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}

/** Field -> first message, for showing errors under inputs. */
export function fieldErrors(err: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (err instanceof ApiError && err.errors) {
    for (const [field, messages] of Object.entries(err.errors)) {
      if (messages?.[0]) out[field] = messages[0];
    }
  }
  return out;
}
