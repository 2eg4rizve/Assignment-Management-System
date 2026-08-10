export type UserSummary = { id: string; fullName: string; email: string };
export type CourseSummary = {
  id: string;
  code: string;
  name: string;
  academicYear: string | null;
  section: string | null;
};
export type SubjectSummary = { id: string; code: string; name: string };

export type TeachingAssignment = {
  id: string;
  teacher: UserSummary;
  course: CourseSummary;
  subject: SubjectSummary;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type CreateTeachingAssignmentInput = {
  teacherId: string;
  courseId: string;
  subjectId: string;
};
export type UpdateTeachingAssignmentInput = CreateTeachingAssignmentInput & {
  isActive: boolean;
};
export type TeachingAssignmentFilters = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  teacherId?: string;
  courseId?: string;
  subjectId?: string;
  isActive?: boolean;
};
