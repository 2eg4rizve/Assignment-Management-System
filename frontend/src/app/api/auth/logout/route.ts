import { cookies } from "next/headers";

import {
  accessTokenCookieName,
  clearSession,
  refreshTokenCookieName,
} from "@/features/auth/server/session";
import { apiRequest } from "@/shared/api/api-client";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(accessTokenCookieName)?.value;
  const refreshToken = cookieStore.get(refreshTokenCookieName)?.value;

  try {
    if (accessToken && refreshToken) {
      await apiRequest<void>("auth/logout", {
        accessToken,
        body: { refreshToken },
        method: "POST",
        retry: false,
      });
    }
  } finally {
    clearSession(cookieStore);
  }

  return new Response(null, { status: 204 });
}
