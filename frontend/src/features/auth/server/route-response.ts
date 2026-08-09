import "server-only";

import { ApiError } from "@/shared/api/api-error";

export function authErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    const status =
      error.status >= 400 && error.status <= 599 ? error.status : 502;
    return Response.json(
      error.problem ?? {
        status,
        title:
          status === 502
            ? "Backend API unavailable"
            : "Authentication request failed",
      },
      { status },
    );
  }

  return Response.json(
    { status: 500, title: "Authentication request failed" },
    { status: 500 },
  );
}
