import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  accessTokenCookieName,
  refreshTokenCookieName,
} from "@/features/auth/server/session";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSession =
    cookieStore.has(accessTokenCookieName) ||
    cookieStore.has(refreshTokenCookieName);

  redirect(hasSession ? "/dashboard" : "/login");
}
