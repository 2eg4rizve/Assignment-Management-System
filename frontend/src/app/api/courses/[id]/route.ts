import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  Course,
  UpdateCourseInput,
} from "@/features/courses/courses.types";
import { apiErrorResponse } from "@/shared/api/route-response";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<Course>(await cookies(), `courses/${id}`),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<Course>(await cookies(), `courses/${id}`, {
        method: "PUT",
        body: (await request.json()) as UpdateCourseInput,
      }),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function DELETE(_: Request, context: Context) {
  const { id } = await context.params;
  try {
    await authenticatedApiRequest<void>(await cookies(), `courses/${id}`, {
      method: "DELETE",
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
