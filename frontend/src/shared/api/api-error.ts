import type { ProblemDetails } from "./contracts";

export class ApiError extends Error {
  readonly problem?: ProblemDetails;
  readonly status: number;
  readonly traceId?: string;

  constructor(
    message: string,
    options: {
      cause?: unknown;
      problem?: ProblemDetails;
      status: number;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.problem = options.problem;
    this.status = options.status;
    this.traceId = options.problem?.traceId;
  }
}
