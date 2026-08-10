import { browserRequest } from "@/shared/api/browser-client";
import type { PagedResponse } from "@/shared/api/contracts";
import type {
  CreateEnrollmentInput,
  Enrollment,
  EnrollmentFilters,
} from "./enrollments.types";

export function getEnrollments(filters: EnrollmentFilters) {
  const query = new URLSearchParams({
    pageNumber: String(filters.pageNumber),
    pageSize: String(filters.pageSize),
  });
  if (filters.search) query.set("search", filters.search);
  if (filters.studentId) query.set("studentId", filters.studentId);
  if (filters.courseId) query.set("courseId", filters.courseId);
  if (filters.isActive !== undefined)
    query.set("isActive", String(filters.isActive));
  return browserRequest<PagedResponse<Enrollment>>(`/api/enrollments?${query}`);
}
export function getEnrollment(id: string) {
  return browserRequest<Enrollment>(`/api/enrollments/${id}`);
}
export function createEnrollment(input: CreateEnrollmentInput) {
  return browserRequest<Enrollment>("/api/enrollments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function deactivateEnrollment(id: string) {
  return browserRequest<void>(`/api/enrollments/${id}`, { method: "DELETE" });
}
