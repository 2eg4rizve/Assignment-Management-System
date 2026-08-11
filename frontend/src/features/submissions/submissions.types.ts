import type {
  AssignmentStatus,
  SubmissionStatus,
} from "@/shared/api/contracts";
import type {
  CourseSummary,
  SubjectSummary,
  UserSummary,
} from "@/features/teaching-assignments/teaching-assignments.types";

export type SubmissionListItem = {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: SubmissionStatus;
  courseId: string;
  courseName: string;
  subjectId: string;
  subjectName: string;
  submittedAtUtc: string;
  lastSubmittedAtUtc: string;
  marksAwarded: number | null;
  maximumMarks: number;
  isLate: boolean;
};
export type SubmissionDetail = {
  id: string;
  assignment: {
    id: string;
    title: string;
    deadlineUtc: string;
    maximumMarks: number;
    status: AssignmentStatus;
    course: CourseSummary;
    subject: SubjectSummary;
  };
  student: UserSummary;
  answerText: string;
  status: SubmissionStatus;
  submittedAtUtc: string;
  lastSubmittedAtUtc: string;
  marksAwarded: number | null;
  maximumMarks: number;
  feedback: string | null;
  gradedAtUtc: string | null;
  gradedByName: string | null;
  rowVersion: string;
};
export type SubmissionMutation = {
  id: string;
  status: SubmissionStatus;
  lastSubmittedAtUtc: string;
  marksAwarded: number | null;
  gradedAtUtc: string | null;
  rowVersion: string;
};
export type SubmissionFilters = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  assignmentId?: string;
  studentId?: string;
  courseId?: string;
  subjectId?: string;
  status?: SubmissionStatus;
  isLate?: boolean;
  hasGrade?: boolean;
  submittedFromUtc?: string;
  submittedToUtc?: string;
  sortDirection?: "Asc" | "Desc";
};
export type GradeSubmissionInput = {
  marksAwarded: number;
  feedback?: string;
  publishGrade: boolean;
  rowVersion: string;
};
