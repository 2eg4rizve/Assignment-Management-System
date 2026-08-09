import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/api-error";

import type { AuthResponse, CurrentUser } from "../auth.types";
import {
  accessTokenCookieName,
  getCurrentUserWithRefresh,
  refreshTokenCookieName,
  writeSession,
  type SessionCookieStore,
} from "./session";

const user: CurrentUser = {
  email: "teacher@assignment.local",
  firstName: "Demo",
  fullName: "Demo Teacher",
  id: "user-1",
  lastName: "Teacher",
  roles: ["Teacher"],
};

const refreshedAuth: AuthResponse = {
  accessToken: "new-access-token",
  expiresAtUtc: "2030-01-01T00:00:00Z",
  refreshToken: "new-refresh-token",
  user,
};

function createCookieStore(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const store: SessionCookieStore = {
    get: (name) => {
      const value = values.get(name);
      return value === undefined ? undefined : { value };
    },
    set: (name, value, options) => {
      if (options.expires && options.expires.getTime() <= Date.now()) {
        values.delete(name);
      } else {
        values.set(name, value);
      }
    },
  };

  return { store, values };
}

describe("authenticated session", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses Secure, HttpOnly, SameSite cookies in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const set = vi.fn<SessionCookieStore["set"]>();
    const store: SessionCookieStore = { get: () => undefined, set };

    writeSession(store, refreshedAuth);

    expect(set).toHaveBeenCalledTimes(2);
    for (const call of set.mock.calls) {
      expect(call[2]).toMatchObject({
        httpOnly: true,
        sameSite: "lax",
        secure: true,
      });
    }
  });

  it("returns the current user with a valid access token", async () => {
    const { store } = createCookieStore({
      [accessTokenCookieName]: "access-token",
    });
    const request = vi.fn().mockResolvedValue(user);

    await expect(getCurrentUserWithRefresh(store, request)).resolves.toEqual(
      user,
    );
    expect(request).toHaveBeenCalledOnce();
  });

  it("rotates tokens and retries current-user lookup once after a 401", async () => {
    const { store, values } = createCookieStore({
      [accessTokenCookieName]: "expired-access-token",
      [refreshTokenCookieName]: "refresh-token",
    });
    const request = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Expired", { status: 401 }))
      .mockResolvedValueOnce(refreshedAuth)
      .mockResolvedValueOnce(user);

    await expect(getCurrentUserWithRefresh(store, request)).resolves.toEqual(
      user,
    );
    expect(request).toHaveBeenCalledTimes(3);
    expect(values.get(accessTokenCookieName)).toBe("new-access-token");
    expect(values.get(refreshTokenCookieName)).toBe("new-refresh-token");
  });

  it("clears an expired session when refresh fails", async () => {
    const { store, values } = createCookieStore({
      [accessTokenCookieName]: "expired-access-token",
      [refreshTokenCookieName]: "invalid-refresh-token",
    });
    const request = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Expired", { status: 401 }))
      .mockRejectedValueOnce(new ApiError("Invalid refresh", { status: 401 }));

    await expect(getCurrentUserWithRefresh(store, request)).resolves.toBeNull();
    expect(values.size).toBe(0);
  });

  it("preserves a 403 so the UI can show the unauthorized page", async () => {
    const { store } = createCookieStore({
      [accessTokenCookieName]: "access-token",
    });
    const forbidden = new ApiError("Forbidden", { status: 403 });
    const request = vi.fn().mockRejectedValue(forbidden);

    await expect(getCurrentUserWithRefresh(store, request)).rejects.toBe(
      forbidden,
    );
  });
});
