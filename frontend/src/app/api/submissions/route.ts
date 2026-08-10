import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type { SubmissionListItem } from "@/features/submissions/submissions.types";
import type { PagedResponse } from "@/shared/api/contracts";
import { apiErrorResponse } from "@/shared/api/route-response";
export async function GET(request: Request) {
  try {
    return Response.json(
      await authenticatedApiRequest<PagedResponse<SubmissionListItem>>(
        await cookies(),
        "submissions",
        { query: Object.fromEntries(new URL(request.url).searchParams) },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
