import { cookies } from "next/headers";

import { loginSchema } from "@/features/auth/auth.schema";
import { getDashboardPath } from "@/features/auth/auth-routing";
import type { AuthResponse } from "@/features/auth/auth.types";
import { authErrorResponse } from "@/features/auth/server/route-response";
import { writeSession } from "@/features/auth/server/session";
import { apiRequest } from "@/shared/api/api-client";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        status: 400,
        title: "Validation failed",
      },
      { status: 400 },
    );
  }

  try {
    const auth = await apiRequest<AuthResponse>("auth/login", {
      body: parsed.data,
      method: "POST",
      retry: false,
    });
    writeSession(await cookies(), auth);

    return Response.json({
      redirectTo: getDashboardPath(auth.user.roles),
      user: auth.user,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
