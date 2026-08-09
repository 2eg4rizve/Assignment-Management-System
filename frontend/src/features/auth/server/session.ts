import "server-only";

import { ApiError } from "@/shared/api/api-error";
import { apiRequest, type ApiRequestOptions } from "@/shared/api/api-client";

import type { AuthResponse, CurrentUser } from "../auth.types";

export const accessTokenCookieName = "ams_access_token";
export const refreshTokenCookieName = "ams_refresh_token";

type CookieValue = { value: string };

export type SessionCookieStore = {
  get(name: string): CookieValue | undefined;
  set(
    name: string,
    value: string,
    options: {
      expires?: Date;
      httpOnly: boolean;
      path: string;
      sameSite: "lax";
      secure: boolean;
    },
  ): void;
};

type AuthRequest = typeof apiRequest;

function cookieOptions(expires: Date) {
  return {
    expires,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function writeSession(
  cookieStore: SessionCookieStore,
  auth: AuthResponse,
) {
  cookieStore.set(
    accessTokenCookieName,
    auth.accessToken,
    cookieOptions(new Date(auth.expiresAtUtc)),
  );
  cookieStore.set(
    refreshTokenCookieName,
    auth.refreshToken,
    cookieOptions(new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000)),
  );
}

export function clearSession(cookieStore: SessionCookieStore) {
  const expired = cookieOptions(new Date(0));
  cookieStore.set(accessTokenCookieName, "", expired);
  cookieStore.set(refreshTokenCookieName, "", expired);
}

export async function refreshSession(
  cookieStore: SessionCookieStore,
  request: AuthRequest = apiRequest,
) {
  const refreshToken = cookieStore.get(refreshTokenCookieName)?.value;
  if (!refreshToken) {
    clearSession(cookieStore);
    return null;
  }

  try {
    const auth = await request<AuthResponse>("auth/refresh", {
      body: { refreshToken },
      method: "POST",
      retry: false,
    });
    writeSession(cookieStore, auth);
    return auth;
  } catch {
    clearSession(cookieStore);
    return null;
  }
}

export async function getCurrentUserWithRefresh(
  cookieStore: SessionCookieStore,
  request: AuthRequest = apiRequest,
): Promise<CurrentUser | null> {
  const accessToken = cookieStore.get(accessTokenCookieName)?.value;
  if (!accessToken) {
    const refreshed = await refreshSession(cookieStore, request);
    return refreshed?.user ?? null;
  }

  try {
    return await request<CurrentUser>("auth/me", {
      accessToken,
      retry: false,
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
  }

  const refreshed = await refreshSession(cookieStore, request);
  if (!refreshed) {
    return null;
  }

  try {
    return await request<CurrentUser>("auth/me", {
      accessToken: refreshed.accessToken,
      retry: false,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession(cookieStore);
      return null;
    }

    throw error;
  }
}

export async function authenticatedApiRequest<T>(
  cookieStore: SessionCookieStore,
  path: string,
  options: ApiRequestOptions = {},
  request: AuthRequest = apiRequest,
): Promise<T> {
  let accessToken = cookieStore.get(accessTokenCookieName)?.value;
  if (!accessToken) {
    const refreshed = await refreshSession(cookieStore, request);
    accessToken = refreshed?.accessToken;
  }

  if (!accessToken) {
    throw new ApiError("Your session has expired.", { status: 401 });
  }

  try {
    return await request<T>(path, {
      ...options,
      accessToken,
      retry: false,
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
  }

  const refreshed = await refreshSession(cookieStore, request);
  if (!refreshed) {
    throw new ApiError("Your session has expired.", { status: 401 });
  }

  return request<T>(path, {
    ...options,
    accessToken: refreshed.accessToken,
    retry: false,
  });
}
