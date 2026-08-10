"use client";
import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/features/courses/courses.api";
import { getUsers } from "@/features/users/users.api";
export function useEnrollmentOptions() {
  const students = useQuery({
    queryKey: ["users", "options", "Student"],
    queryFn: () =>
      getUsers({
        pageNumber: 1,
        pageSize: 100,
        role: "Student",
        isActive: true,
      }),
  });
  const courses = useQuery({
    queryKey: ["courses", "options"],
    queryFn: () => getCourses({ pageNumber: 1, pageSize: 100, isActive: true }),
  });
  return {
    students,
    courses,
    isPending: students.isPending || courses.isPending,
    error: students.error ?? courses.error,
  };
}
