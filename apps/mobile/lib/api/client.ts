import { ApiError, normalizeError } from "./errors";
import type { ApiErrorBody } from "./errors";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. Add it to your .env file (see .env.example).",
  );
}

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;

/** Set by the auth feature once BetterAuth session handling lands (Phase 7). */
let authTokenProvider: (() => string | null) | null = null;
export function setAuthTokenProvider(provider: (() => string | null) | null) {
  authTokenProvider = provider;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** GET requests are retried by default; opt out for non-idempotent calls. */
  retry?: boolean;
}

/**
 * Safely constructs a full URL string without relying on React Native's fragile `new URL()` polyfill.
 */
function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  const cleanBase = API_URL!.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  let fullUrl = `${cleanBase}/${cleanPath}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }

  return fullUrl;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseErrorBody(
  response: Response,
): Promise<{ code?: string; message: string }> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return {
      code: body.error?.code,
      message: body.error?.message ?? response.statusText,
    };
  } catch {
    return {
      message:
        response.statusText || `Request failed with status ${response.status}`,
    };
  }
}

async function performRequest<T>(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<T> {
  console.log("👉 API FETCH STARTING:", url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const callerAbortListener = () => controller.abort();
  init.signal?.addEventListener("abort", callerAbortListener);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    console.log("👉 API FETCH SUCCESS:", url, response.status);
    if (!response.ok) {
      const { code, message } = await parseErrorBody(response);
      throw new ApiError({
        kind: "http",
        status: response.status,
        code,
        message,
      });
    }
    if (response.status === 204) return undefined as T;
    const json = await response.json();
    if (json && typeof json === "object" && "data" in json) {
      return (
        json.meta !== undefined
          ? { data: json.data, meta: json.meta }
          : json.data
      ) as T;
    }
    return json as T;
  } catch (error) {
    console.log("👉 API FETCH CATCH ERROR:", url, error);
    if (controller.signal.aborted && !init.signal?.aborted) {
      throw new ApiError({ kind: "timeout", message: "Request timed out." });
    }
    throw normalizeError(error);
  } finally {
    clearTimeout(timeoutId);
    init.signal?.removeEventListener("abort", callerAbortListener);
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions & {
    params?: Record<string, string | number | boolean | undefined>;
  } = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    params,
  } = options;
  const retry = options.retry ?? method === "GET";
  const url = buildUrl(path, params);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = authTokenProvider?.();
  if (token) headers.Authorization = `Bearer ${token}`;

  const init: RequestInit = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  };

  let lastError: ApiError | undefined;
  const attempts = retry ? MAX_RETRIES + 1 : 1;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await performRequest<T>(url, init, timeoutMs);
    } catch (error) {
      const apiError =
        error instanceof ApiError ? error : normalizeError(error);
      lastError = apiError;

      if (
        apiError.kind === "aborted" ||
        !apiError.isRetryable ||
        attempt === attempts - 1
      ) {
        throw apiError;
      }
      await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
    }
  }

  throw (
    lastError ?? new ApiError({ kind: "parse", message: "Request failed." })
  );
}
