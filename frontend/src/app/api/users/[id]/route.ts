import { cookies } from "next/headers";

import { authenticatedApiRequest } from "@/features/auth/server/session";
import type { UpdateUserInput, UserDetail } from "@/features/users/users.types";
import { apiErrorResponse } from "@/shared/api/route-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const user = await authenticatedApiRequest<UserDetail>(
      await cookies(),
      `users/${id}`,
    );
    return Response.json(user);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const input = (await request.json()) as UpdateUserInput;
    const user = await authenticatedApiRequest<UserDetail>(
      await cookies(),
      `users/${id}`,
      { body: input, method: "PUT" },
    );
    return Response.json(user);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
