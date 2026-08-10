import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  AssignmentDetail,
  AssignmentMutation,
  UpdateAssignmentInput,
} from "@/features/assignments/assignments.types";
import { apiErrorResponse } from "@/shared/api/route-response";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<AssignmentDetail>(
        await cookies(),
        `assignments/${id}`,
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
      await authenticatedApiRequest<AssignmentMutation>(
        await cookies(),
        `assignments/${id}`,
        {
          method: "PUT",
          body: (await request.json()) as UpdateAssignmentInput,
        },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  const { id } = await context.params;
  try {
    const rowVersion =
      new URL(request.url).searchParams.get("rowVersion") ?? "";
    await authenticatedApiRequest<void>(await cookies(), `assignments/${id}`, {
      method: "DELETE",
      query: { rowVersion },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
