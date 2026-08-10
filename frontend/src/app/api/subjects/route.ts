import { cookies } from "next/headers";
import { authenticatedApiRequest } from "@/features/auth/server/session";
import type {
  CreateSubjectInput,
  Subject,
} from "@/features/subjects/subjects.types";
import type { PagedResponse } from "@/shared/api/contracts";
import { apiErrorResponse } from "@/shared/api/route-response";
export async function GET(request: Request) {
  try {
    return Response.json(
      await authenticatedApiRequest<PagedResponse<Subject>>(
        await cookies(),
        "subjects",
        { query: Object.fromEntries(new URL(request.url).searchParams) },
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    const subject = await authenticatedApiRequest<Subject>(
      await cookies(),
      "subjects",
      { method: "POST", body: (await request.json()) as CreateSubjectInput },
    );
    return Response.json(subject, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
