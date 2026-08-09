import { ApiError } from "./api-error";
import { isProblemDetails, type ProblemDetails } from "./contracts";
import { getServerEnvironment } from "../config/env";

type QueryValue =
  | boolean
  | number
  | string
  | null
  | undefined
  | readonly (boolean | number | string)[];

export type ApiRequestOptions = {
  accessToken?: string;
  body?: unknown;
  headers?: HeadersInit;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  query?: Readonly<Record<string, QueryValue>>;
  retry?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
};

const retryableStatuses = new Set([502, 503, 504]);

function buildApiUrl(
  path: string,
  query?: Readonly<Record<string, QueryValue>>,
) {
  const { API_BASE_URL } = getServerEnvironment();
  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL
    : `${API_BASE_URL}/`;
  const url = new URL(path.replace(/^\//, ""), baseUrl);

  if (!query) {
    return url;
  }

  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      continue;
    }

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values) {
      url.searchParams.append(key, String(value));
    }
  }

  return url;
}

function createRequestSignal(
  signal: AbortSignal | undefined,
  timeoutMs: number,
) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
}

async function readProblem(
  response: Response,
): Promise<ProblemDetails | undefined> {
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return undefined;
  }

  const payload: unknown = await response.json();
  return isProblemDetails(payload) ? payload : undefined;
}

function canRetry(error: unknown) {
  if (error instanceof ApiError) {
    return retryableStatuses.has(error.status);
  }

  return error instanceof TypeError;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const retry = options.retry ?? method === "GET";
  const attempts = retry ? 2 : 1;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const headers = new Headers(options.headers);
      headers.set("Accept", "application/json");

      if (options.accessToken) {
        headers.set("Authorization", `Bearer ${options.accessToken}`);
      }

      if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(buildApiUrl(path, options.query), {
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
        headers,
        method,
        signal: createRequestSignal(
          options.signal,
          options.timeoutMs ?? 10_000,
        ),
      });

      if (!response.ok) {
        const problem = await readProblem(response);
        throw new ApiError(
          problem?.detail ?? problem?.title ?? "The API request failed.",
          { problem, status: response.status },
        );
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (attempt < attempts && canRetry(error)) {
        continue;
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError("The API could not be reached.", {
        cause: error,
        status: 0,
      });
    }
  }

  throw new ApiError("The API request failed.", { status: 0 });
}
