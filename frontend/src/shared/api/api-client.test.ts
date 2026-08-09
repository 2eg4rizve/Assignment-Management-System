import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./api-error";
import { apiRequest } from "./api-client";

describe("apiRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("builds a typed GET request with query parameters", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:5096/api/v1");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        Response.json({ items: [], totalCount: 0 }, { status: 200 }),
      );

    await apiRequest("subjects", {
      query: { isActive: true, pageNumber: 2, search: "math" },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "http://localhost:5096/api/v1/subjects?isActive=true&pageNumber=2&search=math",
    );
    expect(request?.method).toBe("GET");
  });

  it("preserves Problem Details and traceId", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:5096/api/v1");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        {
          detail: "Subject code already exists.",
          status: 409,
          title: "Resource conflict",
          traceId: "trace-123",
        },
        { status: 409 },
      ),
    );

    const request = apiRequest("subjects", {
      body: { code: "MATH" },
      method: "POST",
    });

    await expect(request).rejects.toMatchObject({
      message: "Subject code already exists.",
      status: 409,
      traceId: "trace-123",
    } satisfies Partial<ApiError>);
  });

  it("handles 204 No Content responses", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:5096/api/v1");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    await expect(
      apiRequest<void>("auth/logout", { method: "POST" }),
    ).resolves.toBeUndefined();
  });

  it("retries one transient GET failure", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:5096/api/v1");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ id: "subject-1" }));

    await expect(apiRequest("subjects/subject-1")).resolves.toEqual({
      id: "subject-1",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
