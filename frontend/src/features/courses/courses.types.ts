export type Course = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  academicYear: string | null;
  section: string | null;
  isActive: boolean;
  studentCount: number;
  subjectTeacherCount: number;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type CreateCourseInput = Pick<Course, "code" | "name"> & {
  description?: string;
  academicYear?: string;
  section?: string;
};

export type UpdateCourseInput = CreateCourseInput & { isActive: boolean };

export type CourseFilters = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  academicYear?: string;
  section?: string;
  isActive?: boolean;
};
