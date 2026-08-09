import { cookies } from "next/headers";

import { authenticatedApiRequest } from "@/features/auth/server/session";
import { apiErrorResponse } from "@/shared/api/route-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const input = (await request.json()) as { newPassword: string };
    await authenticatedApiRequest<void>(
      await cookies(),
      `users/${id}/reset-password`,
      { body: input, method: "POST" },
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
