import type { UserRole } from "@/shared/api/contracts";

export type UserListItem = {
  id: string;
  fullName: string;
  email: string;
  studentCode: string | null;
  teacherCode: string | null;
  roles: UserRole[];
  isActive: boolean;
  createdAtUtc: string;
};

export type UserDetail = UserListItem & {
  firstName: string;
  lastName: string;
  updatedAtUtc: string | null;
};

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  studentCourseId?: string;
  codeYear?: string;
  codeSemester?: string;
};

export type UpdateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  studentCode?: string;
  teacherCode?: string;
  isActive: boolean;
};

export type UserFilters = {
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
  role?: UserRole;
  search?: string;
  createdFromUtc?: string;
  createdToUtc?: string;
  studentCode?: string;
  teacherCode?: string;
};
