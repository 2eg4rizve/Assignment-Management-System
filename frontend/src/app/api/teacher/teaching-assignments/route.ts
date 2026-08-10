import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type { TeachingAssignment } from "@/features/teaching-assignments/teaching-assignments.types";
import type { PagedResponse } from "@/shared/api/contracts";
import { apiErrorResponse } from "@/shared/api/route-response";
export async function GET() {
  try {
    return Response.json(
      await authenticatedApiRequest<PagedResponse<TeachingAssignment>>(
        await cookies(),
        "teacher/teaching-assignments",
        { query: { pageNumber: 1, pageSize: 100, isActive: true } },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
