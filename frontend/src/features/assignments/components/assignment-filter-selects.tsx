"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { AssignmentStatus } from "@/shared/api/contracts";
import { Input } from "@/shared/components/ui/input";
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
  deadlineFromUtc?: string;
  deadlineToUtc?: string;
  minimumMarks?: number;
  maximumMarks?: number;
  allowResubmission?: boolean;
  sort?: string;
  scope: "admin" | "teacher" | "student";
  onFilterChange: (name: string, value?: string) => void;
};

export function AssignmentFilterSelects({
  courseId,
  subjectId,
  teacherId,
  includeTeacher = false,
  requiredStatus,
  deadlineFromUtc,
  deadlineToUtc,
  minimumMarks,
  maximumMarks,
  allowResubmission,
  sort = "Deadline:Asc",
  scope,
  onFilterChange,
}: AssignmentFilterSelectsProps) {
  const [optionSearch, setOptionSearch] = useState("");
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

    const matches = (name: string) =>
      name.toLowerCase().includes(optionSearch.trim().toLowerCase());
    return {
      courses: unique(
        items.map((item) => ({ id: item.courseId, name: item.courseName })),
      ).filter((item) => matches(item.name)),
      subjects: unique(
        items.map((item) => ({ id: item.subjectId, name: item.subjectName })),
      ).filter((item) => matches(item.name)),
      teachers: unique(
        items.map((item) => ({ id: item.teacherId, name: item.teacherName })),
      ).filter((item) => matches(item.name)),
    };
  }, [optionSearch, optionsQuery.data]);

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={`${scope}-option-search`}>Find option</Label>
        <Input
          className="w-44"
          id={`${scope}-option-search`}
          placeholder="Course, subject..."
          value={optionSearch}
          onChange={(event) => setOptionSearch(event.target.value)}
        />
      </div>
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
      <div className="space-y-1.5">
        <Label htmlFor={`${scope}-deadline-from`}>Deadline from</Label>
        <Input
          className="w-40"
          id={`${scope}-deadline-from`}
          type="date"
          value={deadlineFromUtc?.slice(0, 10) ?? ""}
          onChange={(event) =>
            onFilterChange("deadlineFrom", event.target.value || undefined)
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${scope}-deadline-to`}>Deadline to</Label>
        <Input
          className="w-40"
          id={`${scope}-deadline-to`}
          type="date"
          value={deadlineToUtc?.slice(0, 10) ?? ""}
          onChange={(event) =>
            onFilterChange("deadlineTo", event.target.value || undefined)
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${scope}-minimum-marks`}>Min marks</Label>
        <Input
          className="w-28"
          id={`${scope}-minimum-marks`}
          min="0"
          type="number"
          value={minimumMarks ?? ""}
          onChange={(event) =>
            onFilterChange("minMarks", event.target.value || undefined)
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${scope}-maximum-marks`}>Max marks</Label>
        <Input
          className="w-28"
          id={`${scope}-maximum-marks`}
          min="0"
          type="number"
          value={maximumMarks ?? ""}
          onChange={(event) =>
            onFilterChange("maxMarks", event.target.value || undefined)
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label>Resubmission</Label>
        <Select
          value={
            allowResubmission === undefined ? "all" : String(allowResubmission)
          }
          onValueChange={(value) =>
            onFilterChange("resubmission", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-40" aria-label="Filter by resubmission">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="true">Allowed</SelectItem>
            <SelectItem value="false">Not allowed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Sort</Label>
        <Select
          value={sort}
          onValueChange={(value) => onFilterChange("sort", value)}
        >
          <SelectTrigger className="w-44" aria-label="Sort assignments">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Deadline:Asc">Deadline: earliest</SelectItem>
            <SelectItem value="Deadline:Desc">Deadline: latest</SelectItem>
            <SelectItem value="Title:Asc">Title: A–Z</SelectItem>
            <SelectItem value="Title:Desc">Title: Z–A</SelectItem>
            <SelectItem value="CreatedAt:Desc">Newest created</SelectItem>
            <SelectItem value="CreatedAt:Asc">Oldest created</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
