import { browserRequest } from "@/shared/api/browser-client";
import type { PagedResponse } from "@/shared/api/contracts";
import type {
  CreateSubjectInput,
  Subject,
  SubjectFilters,
  UpdateSubjectInput,
} from "./subjects.types";

export function getSubjects(filters: SubjectFilters) {
  const query = new URLSearchParams({
    pageNumber: String(filters.pageNumber),
    pageSize: String(filters.pageSize),
  });
  if (filters.search) query.set("search", filters.search);
  if (filters.isActive !== undefined)
    query.set("isActive", String(filters.isActive));
  return browserRequest<PagedResponse<Subject>>(`/api/subjects?${query}`);
}

export function getSubject(id: string) {
  return browserRequest<Subject>(`/api/subjects/${id}`);
}
export function createSubject(input: CreateSubjectInput) {
  return browserRequest<Subject>("/api/subjects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function updateSubject(id: string, input: UpdateSubjectInput) {
  return browserRequest<Subject>(`/api/subjects/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
export function deactivateSubject(id: string) {
  return browserRequest<void>(`/api/subjects/${id}`, { method: "DELETE" });
}
