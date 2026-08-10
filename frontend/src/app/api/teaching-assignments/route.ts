import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  CreateTeachingAssignmentInput,
  TeachingAssignment,
} from "@/features/teaching-assignments/teaching-assignments.types";
import type { PagedResponse } from "@/shared/api/contracts";
import { apiErrorResponse } from "@/shared/api/route-response";
export async function GET(request: Request) {
  try {
    return Response.json(
      await authenticatedApiRequest<PagedResponse<TeachingAssignment>>(
        await cookies(),
        "teaching-assignments",
        { query: Object.fromEntries(new URL(request.url).searchParams) },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    const result = await authenticatedApiRequest<TeachingAssignment>(
      await cookies(),
      "teaching-assignments",
      {
        method: "POST",
        body: (await request.json()) as CreateTeachingAssignmentInput,
      },
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
