import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type { Enrollment } from "@/features/enrollments/enrollments.types";
import { apiErrorResponse } from "@/shared/api/route-response";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<Enrollment>(
        await cookies(),
        `enrollments/${id}`,
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function DELETE(_: Request, context: Context) {
  const { id } = await context.params;
  try {
    await authenticatedApiRequest<void>(await cookies(), `enrollments/${id}`, {
      method: "DELETE",
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
