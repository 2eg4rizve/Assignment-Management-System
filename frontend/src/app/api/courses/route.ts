import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  Course,
  CreateCourseInput,
} from "@/features/courses/courses.types";
import type { PagedResponse } from "@/shared/api/contracts";
import { apiErrorResponse } from "@/shared/api/route-response";
export async function GET(request: Request) {
  try {
    return Response.json(
      await authenticatedApiRequest<PagedResponse<Course>>(
        await cookies(),
        "courses",
        { query: Object.fromEntries(new URL(request.url).searchParams) },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    const course = await authenticatedApiRequest<Course>(
      await cookies(),
      "courses",
      { method: "POST", body: (await request.json()) as CreateCourseInput },
    );
    return Response.json(course, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
