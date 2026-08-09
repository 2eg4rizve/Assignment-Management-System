import { cookies } from "next/headers";

import { authErrorResponse } from "@/features/auth/server/route-response";
import { getCurrentUserWithRefresh } from "@/features/auth/server/session";

export async function GET() {
  try {
    const user = await getCurrentUserWithRefresh(await cookies());
    if (!user) {
      return Response.json(
        { status: 401, title: "Your session has expired" },
        { status: 401 },
      );
    }

    return Response.json({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
