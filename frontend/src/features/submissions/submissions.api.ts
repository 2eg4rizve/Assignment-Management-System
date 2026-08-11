import { browserRequest } from "@/shared/api/browser-client";
import type { PagedResponse } from "@/shared/api/contracts";
import type {
  GradeSubmissionInput,
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
  if (filters.search) query.set("search", filters.search);
  if (filters.assignmentId) query.set("assignmentId", filters.assignmentId);
  if (filters.courseId) query.set("courseId", filters.courseId);
  if (filters.subjectId) query.set("subjectId", filters.subjectId);
  if (filters.status) query.set("status", filters.status);
  if (filters.isLate !== undefined) query.set("isLate", String(filters.isLate));
  if (filters.hasGrade !== undefined)
    query.set("hasGrade", String(filters.hasGrade));
  if (filters.minimumMarks !== undefined)
    query.set("minimumMarks", String(filters.minimumMarks));
  if (filters.maximumMarks !== undefined)
    query.set("maximumMarks", String(filters.maximumMarks));
  if (filters.submittedFromUtc)
    query.set("submittedFromUtc", filters.submittedFromUtc);
  if (filters.submittedToUtc)
    query.set("submittedToUtc", filters.submittedToUtc);
  if (filters.sortDirection) query.set("sortDirection", filters.sortDirection);
  return browserRequest<PagedResponse<SubmissionListItem>>(
    `/api/my-submissions?${query}`,
  );
}
export function getSubmissions(filters: SubmissionFilters) {
  const query = new URLSearchParams({
    pageNumber: String(filters.pageNumber),
    pageSize: String(filters.pageSize),
  });
  if (filters.search) query.set("search", filters.search);
  if (filters.assignmentId) query.set("assignmentId", filters.assignmentId);
  if (filters.studentId) query.set("studentId", filters.studentId);
  if (filters.courseId) query.set("courseId", filters.courseId);
  if (filters.subjectId) query.set("subjectId", filters.subjectId);
  if (filters.status) query.set("status", filters.status);
  if (filters.isLate !== undefined) query.set("isLate", String(filters.isLate));
  if (filters.hasGrade !== undefined)
    query.set("hasGrade", String(filters.hasGrade));
  if (filters.gradedById) query.set("gradedById", filters.gradedById);
  if (filters.minimumMarks !== undefined)
    query.set("minimumMarks", String(filters.minimumMarks));
  if (filters.maximumMarks !== undefined)
    query.set("maximumMarks", String(filters.maximumMarks));
  if (filters.submittedFromUtc)
    query.set("submittedFromUtc", filters.submittedFromUtc);
  if (filters.submittedToUtc)
    query.set("submittedToUtc", filters.submittedToUtc);
  if (filters.sortDirection) query.set("sortDirection", filters.sortDirection);
  return browserRequest<PagedResponse<SubmissionListItem>>(
    `/api/submissions?${query}`,
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
export function updateSubmissionStatus(
  id: string,
  status: "UnderReview" | "Returned",
  rowVersion: string,
) {
  return browserRequest<SubmissionMutation>(
    `/api/submissions/${id}/review-status`,
    { method: "PUT", body: JSON.stringify({ status, rowVersion }) },
  );
}
export function gradeSubmission(id: string, input: GradeSubmissionInput) {
  return browserRequest<SubmissionMutation>(`/api/submissions/${id}/grade`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
