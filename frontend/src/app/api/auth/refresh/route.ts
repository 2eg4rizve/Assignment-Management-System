import { cookies } from "next/headers";

import { refreshSession } from "@/features/auth/server/session";

export async function POST() {
  const auth = await refreshSession(await cookies());
  if (!auth) {
    return Response.json(
      { status: 401, title: "Your session has expired" },
      { status: 401 },
    );
  }

  return Response.json({ user: auth.user });
}
