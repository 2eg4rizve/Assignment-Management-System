"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { getMySubmissions, getSubmissions } from "../submissions.api";
import type { SubmissionFilters } from "../submissions.types";

type FilterName =
  | "assignment"
  | "course"
  | "subject"
  | "student"
  | "late"
  | "graded"
  | "from"
  | "to";

type Props = {
  filters: SubmissionFilters;
  mode: "admin" | "teacher" | "student";
  assignmentLocked?: boolean;
  onFilterChange: (name: FilterName, value?: string) => void;
};

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function toUtcDate(value: string, endOfDay = false) {
  if (!value) return undefined;
  return new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`,
  ).toISOString();
}

export function SubmissionFilterControls({
  filters,
  mode,
  assignmentLocked = false,
  onFilterChange,
}: Props) {
  const optionsQuery = useQuery({
    queryKey: ["submissions", "filter-options", mode],
    queryFn: () =>
      mode === "student"
        ? getMySubmissions({ pageNumber: 1, pageSize: 100 })
        : getSubmissions({ pageNumber: 1, pageSize: 100 }),
  });
  const options = useMemo(() => {
    const items = optionsQuery.data?.items ?? [];
    const unique = <T extends { id: string }>(values: T[]) => [
      ...new Map(values.map((value) => [value.id, value])).values(),
    ];
    return {
      assignments: unique(
        items.map((item) => ({
          id: item.assignmentId,
          name: item.assignmentTitle,
        })),
      ),
      courses: unique(
        items.map((item) => ({ id: item.courseId, name: item.courseName })),
      ),
      subjects: unique(
        items.map((item) => ({ id: item.subjectId, name: item.subjectName })),
      ),
      students: unique(
        items.map((item) => ({ id: item.studentId, name: item.studentName })),
      ),
    };
  }, [optionsQuery.data]);

  const select = (
    label: string,
    name: FilterName,
    value: string | undefined,
    values: { id: string; name: string }[],
  ) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        disabled={optionsQuery.isPending}
        value={value ?? "all"}
        onValueChange={(next) =>
          onFilterChange(name, next === "all" ? undefined : next)
        }
      >
        <SelectTrigger
          className="w-48"
          aria-label={`Filter by ${label.toLowerCase()}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLowerCase()}s</SelectItem>
          {values.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      {!assignmentLocked
        ? select(
            "Assignment",
            "assignment",
            filters.assignmentId,
            options.assignments,
          )
        : null}
      {select("Course", "course", filters.courseId, options.courses)}
      {select("Subject", "subject", filters.subjectId, options.subjects)}
      {mode !== "student"
        ? select("Student", "student", filters.studentId, options.students)
        : null}

      <div className="space-y-1.5">
        <Label>Timing</Label>
        <Select
          value={filters.isLate === undefined ? "all" : String(filters.isLate)}
          onValueChange={(value) =>
            onFilterChange("late", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger
            className="w-40"
            aria-label="Filter by submission timing"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any timing</SelectItem>
            <SelectItem value="false">On time</SelectItem>
            <SelectItem value="true">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Grade</Label>
        <Select
          value={
            filters.hasGrade === undefined ? "all" : String(filters.hasGrade)
          }
          onValueChange={(value) =>
            onFilterChange("graded", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-40" aria-label="Filter by grade">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any grade</SelectItem>
            <SelectItem value="true">Graded</SelectItem>
            <SelectItem value="false">Not graded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-submitted-from`}>Submitted from</Label>
        <Input
          className="w-40"
          id={`${mode}-submitted-from`}
          type="date"
          value={toDateInput(filters.submittedFromUtc)}
          onChange={(event) =>
            onFilterChange("from", toUtcDate(event.target.value))
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-submitted-to`}>Submitted to</Label>
        <Input
          className="w-40"
          id={`${mode}-submitted-to`}
          type="date"
          value={toDateInput(filters.submittedToUtc)}
          onChange={(event) =>
            onFilterChange("to", toUtcDate(event.target.value, true))
          }
        />
      </div>
    </>
  );
}
