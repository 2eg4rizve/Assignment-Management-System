import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type { AssignmentMutation } from "@/features/assignments/assignments.types";
import { apiErrorResponse } from "@/shared/api/route-response";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<AssignmentMutation>(
        await cookies(),
        `assignments/${id}/publish`,
        {
          method: "POST",
          body: (await request.json()) as { rowVersion: string },
        },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
