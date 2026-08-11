import { browserRequest } from "@/shared/api/browser-client";
import type { PagedResponse } from "@/shared/api/contracts";

import type {
  CreateUserInput,
  UpdateUserInput,
  UserDetail,
  UserFilters,
  UserListItem,
} from "./users.types";

function usersUrl(filters: UserFilters) {
  const query = new URLSearchParams({
    pageNumber: String(filters.pageNumber),
    pageSize: String(filters.pageSize),
  });
  if (filters.search) query.set("search", filters.search);
  if (filters.role) query.set("role", filters.role);
  if (filters.isActive !== undefined) {
    query.set("isActive", String(filters.isActive));
  }
  if (filters.createdFromUtc)
    query.set("createdFromUtc", filters.createdFromUtc);
  if (filters.createdToUtc) query.set("createdToUtc", filters.createdToUtc);
  return `/api/users?${query}`;
}

export function getUsers(filters: UserFilters) {
  return browserRequest<PagedResponse<UserListItem>>(usersUrl(filters));
}

export function getUser(id: string) {
  return browserRequest<UserDetail>(`/api/users/${id}`);
}

export function createUser(input: CreateUserInput) {
  return browserRequest<UserDetail>("/api/users", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function updateUser(id: string, input: UpdateUserInput) {
  return browserRequest<UserDetail>(`/api/users/${id}`, {
    body: JSON.stringify(input),
    method: "PUT",
  });
}

export function resetUserPassword(id: string, newPassword: string) {
  return browserRequest<void>(`/api/users/${id}/reset-password`, {
    body: JSON.stringify({ newPassword }),
    method: "POST",
  });
}
