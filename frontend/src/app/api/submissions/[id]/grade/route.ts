import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  GradeSubmissionInput,
  SubmissionMutation,
} from "@/features/submissions/submissions.types";
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
        `submissions/${id}/grade`,
        { method: "PUT", body: (await request.json()) as GradeSubmissionInput },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
