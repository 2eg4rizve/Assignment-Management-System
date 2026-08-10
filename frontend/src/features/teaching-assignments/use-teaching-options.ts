"use client";
import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/features/courses/courses.api";
import { getSubjects } from "@/features/subjects/subjects.api";
import { getUsers } from "@/features/users/users.api";

export function useTeachingOptions() {
  const teachers = useQuery({
    queryKey: ["users", "options", "Teacher"],
    queryFn: () =>
      getUsers({
        pageNumber: 1,
        pageSize: 100,
        role: "Teacher",
        isActive: true,
      }),
  });
  const courses = useQuery({
    queryKey: ["courses", "options"],
    queryFn: () => getCourses({ pageNumber: 1, pageSize: 100, isActive: true }),
  });
  const subjects = useQuery({
    queryKey: ["subjects", "options"],
    queryFn: () =>
      getSubjects({ pageNumber: 1, pageSize: 100, isActive: true }),
  });
  return {
    teachers,
    courses,
    subjects,
    isPending: teachers.isPending || courses.isPending || subjects.isPending,
    error: teachers.error ?? courses.error ?? subjects.error,
  };
}
