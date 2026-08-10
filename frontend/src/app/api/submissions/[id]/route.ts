import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type { SubmissionDetail } from "@/features/submissions/submissions.types";
import { apiErrorResponse } from "@/shared/api/route-response";
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<SubmissionDetail>(
        await cookies(),
        `submissions/${id}`,
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
