import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  TeachingAssignment,
  UpdateTeachingAssignmentInput,
} from "@/features/teaching-assignments/teaching-assignments.types";
import { apiErrorResponse } from "@/shared/api/route-response";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<TeachingAssignment>(
        await cookies(),
        `teaching-assignments/${id}`,
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<TeachingAssignment>(
        await cookies(),
        `teaching-assignments/${id}`,
        {
          method: "PUT",
          body: (await request.json()) as UpdateTeachingAssignmentInput,
        },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function DELETE(_: Request, context: Context) {
  const { id } = await context.params;
  try {
    await authenticatedApiRequest<void>(
      await cookies(),
      `teaching-assignments/${id}`,
      { method: "DELETE" },
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
