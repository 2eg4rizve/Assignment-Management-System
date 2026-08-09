export type UserRole = "Admin" | "Teacher" | "Student";

export type AssignmentStatus = "Draft" | "Published" | "Closed";

export type SubmissionStatus =
  "Submitted" | "UnderReview" | "Graded" | "Returned";

export type SortDirection = "Asc" | "Desc";

export type PaginationParams = {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
};

export type PagedResponse<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ProblemDetails = {
  detail?: string;
  instance?: string;
  status: number;
  title: string;
  traceId?: string;
  type?: string;
};

export type ValidationProblemDetails = ProblemDetails & {
  errors: Record<string, string[]>;
};

export function isProblemDetails(value: unknown): value is ProblemDetails {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.status === "number" && typeof candidate.title === "string"
  );
}

export function isValidationProblemDetails(
  value: unknown,
): value is ValidationProblemDetails {
  return (
    isProblemDetails(value) &&
    "errors" in value &&
    typeof value.errors === "object" &&
    value.errors !== null
  );
}
