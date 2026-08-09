import { ApiError } from "./api-error";
import { isProblemDetails } from "./contracts";

export async function browserRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => undefined);
    const problem = isProblemDetails(payload) ? payload : undefined;
    throw new ApiError(
      problem?.detail ??
        problem?.title ??
        "The request could not be completed.",
      { problem, status: response.status },
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
