import { browserRequest } from "@/shared/api/browser-client";
import type { PagedResponse } from "@/shared/api/contracts";
import type {
  Course,
  CourseFilters,
  CreateCourseInput,
  UpdateCourseInput,
} from "./courses.types";

export function getCourses(filters: CourseFilters) {
  const query = new URLSearchParams({
    pageNumber: String(filters.pageNumber),
    pageSize: String(filters.pageSize),
  });
  if (filters.search) query.set("search", filters.search);
  if (filters.academicYear) query.set("academicYear", filters.academicYear);
  if (filters.section) query.set("section", filters.section);
  if (filters.isActive !== undefined)
    query.set("isActive", String(filters.isActive));
  return browserRequest<PagedResponse<Course>>(`/api/courses?${query}`);
}

export function getCourse(id: string) {
  return browserRequest<Course>(`/api/courses/${id}`);
}
export function createCourse(input: CreateCourseInput) {
  return browserRequest<Course>("/api/courses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function updateCourse(id: string, input: UpdateCourseInput) {
  return browserRequest<Course>(`/api/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
export function deactivateCourse(id: string) {
  return browserRequest<void>(`/api/courses/${id}`, { method: "DELETE" });
}
