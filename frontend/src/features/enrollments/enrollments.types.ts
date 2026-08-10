import type {
  CourseSummary,
  UserSummary,
} from "@/features/teaching-assignments/teaching-assignments.types";

export type Enrollment = {
  id: string;
  student: UserSummary;
  course: CourseSummary;
  enrolledAtUtc: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type CreateEnrollmentInput = { studentId: string; courseId: string };
export type EnrollmentFilters = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  studentId?: string;
  courseId?: string;
  isActive?: boolean;
};
