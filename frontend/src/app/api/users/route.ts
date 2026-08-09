import { cookies } from "next/headers";

import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  CreateUserInput,
  UserDetail,
  UserListItem,
} from "@/features/users/users.types";
import type { PagedResponse } from "@/shared/api/contracts";
import { apiErrorResponse } from "@/shared/api/route-response";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams);
  try {
    const users = await authenticatedApiRequest<PagedResponse<UserListItem>>(
      await cookies(),
      "users",
      { query },
    );
    return Response.json(users);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CreateUserInput;
    const user = await authenticatedApiRequest<UserDetail>(
      await cookies(),
      "users",
      { body: input, method: "POST" },
    );
    return Response.json(user, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
