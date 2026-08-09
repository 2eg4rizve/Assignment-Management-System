import "server-only";

import { ApiError } from "./api-error";

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    const status =
      error.status >= 400 && error.status <= 599 ? error.status : 502;
    return Response.json(
      error.problem ?? {
        status,
        title: status === 502 ? "Backend API unavailable" : error.message,
      },
      { status },
    );
  }

  return Response.json(
    { status: 500, title: "The request could not be completed" },
    { status: 500 },
  );
}
