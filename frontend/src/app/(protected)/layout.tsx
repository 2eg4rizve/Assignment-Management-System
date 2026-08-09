import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AuthenticatedShell } from "@/features/auth/components/authenticated-shell";
import {
  accessTokenCookieName,
  refreshTokenCookieName,
} from "@/features/auth/server/session";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  if (
    !cookieStore.has(accessTokenCookieName) &&
    !cookieStore.has(refreshTokenCookieName)
  ) {
    redirect("/login");
  }

  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
