import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type { SubmissionMutation } from "@/features/submissions/submissions.types";
import { apiErrorResponse } from "@/shared/api/route-response";
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<SubmissionMutation>(
        await cookies(),
        `submissions/${id}/review-status`,
        {
          method: "PUT",
          body: (await request.json()) as {
            status: string;
            rowVersion: string;
          },
        },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
