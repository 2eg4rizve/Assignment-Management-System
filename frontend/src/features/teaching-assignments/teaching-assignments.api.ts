import { browserRequest } from "@/shared/api/browser-client";
import type { PagedResponse } from "@/shared/api/contracts";
import type {
  CreateTeachingAssignmentInput,
  TeachingAssignment,
  TeachingAssignmentFilters,
  UpdateTeachingAssignmentInput,
} from "./teaching-assignments.types";

export function getTeachingAssignments(filters: TeachingAssignmentFilters) {
  const query = new URLSearchParams({
    pageNumber: String(filters.pageNumber),
    pageSize: String(filters.pageSize),
  });
  if (filters.search) query.set("search", filters.search);
  if (filters.teacherId) query.set("teacherId", filters.teacherId);
  if (filters.courseId) query.set("courseId", filters.courseId);
  if (filters.subjectId) query.set("subjectId", filters.subjectId);
  if (filters.isActive !== undefined)
    query.set("isActive", String(filters.isActive));
  return browserRequest<PagedResponse<TeachingAssignment>>(
    `/api/teaching-assignments?${query}`,
  );
}
export function getTeachingAssignment(id: string) {
  return browserRequest<TeachingAssignment>(`/api/teaching-assignments/${id}`);
}
export function createTeachingAssignment(input: CreateTeachingAssignmentInput) {
  return browserRequest<TeachingAssignment>("/api/teaching-assignments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function updateTeachingAssignment(
  id: string,
  input: UpdateTeachingAssignmentInput,
) {
  return browserRequest<TeachingAssignment>(`/api/teaching-assignments/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
export function deactivateTeachingAssignment(id: string) {
  return browserRequest<void>(`/api/teaching-assignments/${id}`, {
    method: "DELETE",
  });
}
