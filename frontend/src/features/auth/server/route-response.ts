import "server-only";

import { apiErrorResponse } from "@/shared/api/route-response";

export function authErrorResponse(error: unknown) {
  return apiErrorResponse(error);
}
