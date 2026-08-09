import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/api-error";

import { createUser, getUsers } from "./users.api";

describe("users API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("serializes list filters into the same-origin URL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        hasNextPage: false,
        hasPreviousPage: false,
        items: [],
        pageNumber: 2,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
      }),
    );

    await getUsers({
      isActive: true,
      pageNumber: 2,
      pageSize: 20,
      role: "Teacher",
      search: "amina",
    });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/users?pageNumber=2&pageSize=20&search=amina&role=Teacher&isActive=true",
    );
  });

  it("preserves backend conflict details", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        {
          detail: "A user with this email already exists.",
          status: 409,
          title: "Resource conflict",
          traceId: "users-trace",
        },
        { status: 409 },
      ),
    );

    await expect(
      createUser({
        email: "amina@example.com",
        firstName: "Amina",
        lastName: "Rahman",
        password: "Password123!",
        role: "Teacher",
      }),
    ).rejects.toMatchObject({
      message: "A user with this email already exists.",
      status: 409,
      traceId: "users-trace",
    } satisfies Partial<ApiError>);
  });
});
