import type {
  AssignmentStatus,
  SortDirection,
  SubmissionStatus,
} from "@/shared/api/contracts";
import type {
  CourseSummary,
  SubjectSummary,
  UserSummary,
} from "@/features/teaching-assignments/teaching-assignments.types";

export type AssignmentListItem = {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  deadlineUtc: string;
  maximumMarks: number;
  status: AssignmentStatus;
  allowResubmission: boolean;
  submissionCount: number | null;
  hasSubmitted: boolean | null;
  studentSubmissionStatus: SubmissionStatus | null;
  createdAtUtc: string;
};
export type AssignmentDetail = {
  id: string;
  title: string;
  description: string;
  course: CourseSummary;
  subject: SubjectSummary;
  teacher: UserSummary;
  deadlineUtc: string;
  maximumMarks: number;
  status: AssignmentStatus;
  allowResubmission: boolean;
  publishedAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
  submissionSummary: unknown | null;
};
export type AssignmentMutation = {
  id: string;
  status: AssignmentStatus;
  publishedAtUtc: string | null;
  updatedAtUtc: string | null;
  rowVersion: string;
};
export type CreateAssignmentInput = {
  teachingAssignmentId: string;
  title: string;
  description: string;
  deadlineUtc: string;
  maximumMarks: number;
  allowResubmission: boolean;
  publishNow: boolean;
};
export type UpdateAssignmentInput = Omit<
  CreateAssignmentInput,
  "teachingAssignmentId" | "publishNow"
> & { rowVersion: string };
export type AssignmentFilters = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: AssignmentStatus;
  courseId?: string;
  subjectId?: string;
  deadlineFromUtc?: string;
  deadlineToUtc?: string;
  sortBy?: "CreatedAt" | "Deadline" | "Title";
  sortDirection?: SortDirection;
};
