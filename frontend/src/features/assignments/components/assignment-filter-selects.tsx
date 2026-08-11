"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { AssignmentStatus } from "@/shared/api/contracts";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { getAssignments } from "../assignments.api";

type AssignmentFilterSelectsProps = {
  courseId?: string;
  subjectId?: string;
  teacherId?: string;
  includeTeacher?: boolean;
  requiredStatus?: AssignmentStatus;
  scope: "admin" | "teacher" | "student";
  onFilterChange: (
    name: "course" | "subject" | "teacher",
    value?: string,
  ) => void;
};

export function AssignmentFilterSelects({
  courseId,
  subjectId,
  teacherId,
  includeTeacher = false,
  requiredStatus,
  scope,
  onFilterChange,
}: AssignmentFilterSelectsProps) {
  const optionsQuery = useQuery({
    queryKey: ["assignments", "filter-options", scope, requiredStatus],
    queryFn: () =>
      getAssignments({
        pageNumber: 1,
        pageSize: 100,
        status: requiredStatus,
        sortBy: "Title",
        sortDirection: "Asc",
      }),
  });

  const options = useMemo(() => {
    const items = optionsQuery.data?.items ?? [];
    const unique = <T extends { id: string }>(values: T[]) => [
      ...new Map(values.map((value) => [value.id, value])).values(),
    ];

    return {
      courses: unique(
        items.map((item) => ({ id: item.courseId, name: item.courseName })),
      ),
      subjects: unique(
        items.map((item) => ({ id: item.subjectId, name: item.subjectName })),
      ),
      teachers: unique(
        items.map((item) => ({ id: item.teacherId, name: item.teacherName })),
      ),
    };
  }, [optionsQuery.data]);

  return (
    <>
      <div className="space-y-1.5">
        <Label>Course</Label>
        <Select
          disabled={optionsQuery.isPending}
          value={courseId ?? "all"}
          onValueChange={(value) =>
            onFilterChange("course", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-52" aria-label="Filter by course">
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {options.courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Subject</Label>
        <Select
          disabled={optionsQuery.isPending}
          value={subjectId ?? "all"}
          onValueChange={(value) =>
            onFilterChange("subject", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-52" aria-label="Filter by subject">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {options.subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {includeTeacher ? (
        <div className="space-y-1.5">
          <Label>Teacher</Label>
          <Select
            disabled={optionsQuery.isPending}
            value={teacherId ?? "all"}
            onValueChange={(value) =>
              onFilterChange("teacher", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-52" aria-label="Filter by teacher">
              <SelectValue placeholder="All teachers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teachers</SelectItem>
              {options.teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </>
  );
}
