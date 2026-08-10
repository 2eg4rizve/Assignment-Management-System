import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  CreateEnrollmentInput,
  Enrollment,
} from "@/features/enrollments/enrollments.types";
import type { PagedResponse } from "@/shared/api/contracts";
import { apiErrorResponse } from "@/shared/api/route-response";
export async function GET(request: Request) {
  try {
    return Response.json(
      await authenticatedApiRequest<PagedResponse<Enrollment>>(
        await cookies(),
        "enrollments",
        { query: Object.fromEntries(new URL(request.url).searchParams) },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    const result = await authenticatedApiRequest<Enrollment>(
      await cookies(),
      "enrollments",
      { method: "POST", body: (await request.json()) as CreateEnrollmentInput },
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
