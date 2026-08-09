import { ApiError } from "./api-error";
import { getServerEnvironment } from "../config/env";

export type BackendHealth = {
  checkedAtUtc: string;
  status: "healthy";
};

export async function checkBackendHealth(): Promise<BackendHealth> {
  const { API_BASE_URL } = getServerEnvironment();
  const apiUrl = new URL(API_BASE_URL);
  const healthUrl = new URL("/health", apiUrl.origin);

  try {
    const response = await fetch(healthUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      throw new ApiError("The backend health check failed.", {
        status: response.status,
      });
    }

    return {
      checkedAtUtc: new Date().toISOString(),
      status: "healthy",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("The backend API is unavailable.", {
      cause: error,
      status: 0,
    });
  }
}
