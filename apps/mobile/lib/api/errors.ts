export type ApiErrorKind =
  | "network" // request never reached the server (offline, DNS, etc.)
  | "timeout" // request exceeded the timeout budget
  | "http" // server responded with a 4xx/5xx
  | "parse" // response body didn't match the expected shape
  | "aborted"; // caller cancelled via AbortController

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;

  constructor(params: {
    kind: ApiErrorKind;
    message: string;
    status?: number;
    code?: string;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.kind = params.kind;
    this.status = params.status;
    this.code = params.code;
    if (params.cause !== undefined) {
      this.cause = params.cause;
    }
  }

  /** True when the underlying cause is "no connectivity," not a server problem. */
  get isOffline(): boolean {
    return this.kind === "network";
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isRetryable(): boolean {
    return (
      this.kind === "network" ||
      this.kind === "timeout" ||
      (this.kind === "http" && (this.status ?? 0) >= 500)
    );
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError({ kind: "aborted", message: "Request was cancelled." });
  }

  if (error instanceof TypeError) {
    // fetch() throws a bare TypeError for network-level failures.
    return new ApiError({
      kind: "network",
      message: "Unable to reach the server. Check your connection.",
      cause: error,
    });
  }

  return new ApiError({
    kind: "parse",
    message: error instanceof Error ? error.message : "Unknown error.",
    cause: error,
  });
}

export interface ApiErrorBody {
  ok: false;
  error: { code?: string; message: string };
}
