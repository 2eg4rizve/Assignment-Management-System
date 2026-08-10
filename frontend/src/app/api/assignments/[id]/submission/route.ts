import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  SubmissionDetail,
  SubmissionMutation,
} from "@/features/submissions/submissions.types";
import { apiErrorResponse } from "@/shared/api/route-response";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<SubmissionDetail>(
        await cookies(),
        `assignments/${id}/submission`,
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  try {
    const result = await authenticatedApiRequest<SubmissionDetail>(
      await cookies(),
      `assignments/${id}/submission`,
      {
        method: "POST",
        body: (await request.json()) as { answerText: string },
      },
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  try {
    return Response.json(
      await authenticatedApiRequest<SubmissionMutation>(
        await cookies(),
        `assignments/${id}/submission`,
        {
          method: "PUT",
          body: (await request.json()) as {
            answerText: string;
            rowVersion: string;
          },
        },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
