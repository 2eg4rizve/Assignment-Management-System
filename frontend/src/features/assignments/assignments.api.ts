import { browserRequest } from "@/shared/api/browser-client";
import type { PagedResponse } from "@/shared/api/contracts";
import type {
  AssignmentDetail,
  AssignmentFilters,
  AssignmentListItem,
  AssignmentMutation,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "./assignments.types";

export function getAssignments(filters: AssignmentFilters) {
  const query = new URLSearchParams({
    pageNumber: String(filters.pageNumber),
    pageSize: String(filters.pageSize),
  });
  for (const [key, value] of Object.entries(filters))
    if (value !== undefined && key !== "pageNumber" && key !== "pageSize")
      query.set(key, String(value));
  return browserRequest<PagedResponse<AssignmentListItem>>(
    `/api/assignments?${query}`,
  );
}
export function getAssignment(id: string) {
  return browserRequest<AssignmentDetail>(`/api/assignments/${id}`);
}
export function createAssignment(input: CreateAssignmentInput) {
  return browserRequest<AssignmentDetail>("/api/assignments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function updateAssignment(id: string, input: UpdateAssignmentInput) {
  return browserRequest<AssignmentMutation>(`/api/assignments/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
export function publishAssignment(id: string, rowVersion: string) {
  return browserRequest<AssignmentMutation>(`/api/assignments/${id}/publish`, {
    method: "POST",
    body: JSON.stringify({ rowVersion }),
  });
}
export function closeAssignment(id: string, rowVersion: string) {
  return browserRequest<AssignmentMutation>(`/api/assignments/${id}/close`, {
    method: "POST",
    body: JSON.stringify({ rowVersion }),
  });
}
export function deleteAssignment(id: string, rowVersion: string) {
  return browserRequest<void>(
    `/api/assignments/${id}?rowVersion=${encodeURIComponent(rowVersion)}`,
    { method: "DELETE" },
  );
}
