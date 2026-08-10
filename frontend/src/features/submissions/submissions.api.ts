import { browserRequest } from "@/shared/api/browser-client";
import type { PagedResponse } from "@/shared/api/contracts";
import type {
  SubmissionDetail,
  SubmissionFilters,
  SubmissionListItem,
  SubmissionMutation,
} from "./submissions.types";

export function getMySubmissions(filters: SubmissionFilters) {
  const query = new URLSearchParams({
    pageNumber: String(filters.pageNumber),
    pageSize: String(filters.pageSize),
  });
  if (filters.assignmentId) query.set("assignmentId", filters.assignmentId);
  if (filters.status) query.set("status", filters.status);
  if (filters.sortDirection) query.set("sortDirection", filters.sortDirection);
  return browserRequest<PagedResponse<SubmissionListItem>>(
    `/api/my-submissions?${query}`,
  );
}
export function getSubmission(id: string) {
  return browserRequest<SubmissionDetail>(`/api/submissions/${id}`);
}
export function getSubmissionForAssignment(assignmentId: string) {
  return browserRequest<SubmissionDetail>(
    `/api/assignments/${assignmentId}/submission`,
  );
}
export function createSubmission(assignmentId: string, answerText: string) {
  return browserRequest<SubmissionDetail>(
    `/api/assignments/${assignmentId}/submission`,
    { method: "POST", body: JSON.stringify({ answerText }) },
  );
}
export function updateSubmission(
  assignmentId: string,
  answerText: string,
  rowVersion: string,
) {
  return browserRequest<SubmissionMutation>(
    `/api/assignments/${assignmentId}/submission`,
    { method: "PUT", body: JSON.stringify({ answerText, rowVersion }) },
  );
}
