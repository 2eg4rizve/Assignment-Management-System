import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./api-error";
import { checkBackendHealth } from "./health";

describe("checkBackendHealth", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("checks the backend root health endpoint", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:5096/api/v1");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await expect(checkBackendHealth()).resolves.toMatchObject({
      status: "healthy",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:5096/health"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("maps an unhealthy backend to an ApiError", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:5096/api/v1");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    await expect(checkBackendHealth()).rejects.toMatchObject({
      message: "The backend health check failed.",
      status: 500,
    } satisfies Partial<ApiError>);
  });
});
