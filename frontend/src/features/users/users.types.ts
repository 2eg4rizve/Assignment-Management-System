import type { UserRole } from "@/shared/api/contracts";

export type UserListItem = {
  id: string;
  fullName: string;
  email: string;
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
};

export type UpdateUserInput = Omit<CreateUserInput, "password"> & {
  isActive: boolean;
};

export type UserFilters = {
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
  role?: UserRole;
  search?: string;
};
