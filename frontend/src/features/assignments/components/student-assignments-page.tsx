"use client";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { AssignmentStatus } from "@/shared/api/contracts";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-table/data-table";
import { Pagination } from "@/shared/components/data-table/pagination";
import { StatusBadge } from "@/shared/components/data-table/status-badge";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { FilterBar } from "@/shared/components/filters/filter-bar";
import { SearchInput } from "@/shared/components/filters/search-input";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { getAssignments } from "../assignments.api";
import type {
  AssignmentFilters,
  AssignmentListItem,
} from "../assignments.types";
import { AssignmentFilterSelects } from "./assignment-filter-selects";

const columns: readonly DataTableColumn<AssignmentListItem>[] = [
  {
    id: "title",
    header: "Assignment",
    cell: (item) => (
      <div>
        <p className="font-medium">{item.title}</p>
        <p className="text-muted-foreground text-xs">
          {item.courseName} · {item.subjectName}
        </p>
      </div>
    ),
  },
  {
    id: "deadline",
    header: "Deadline",
    cell: (item) =>
      new Intl.DateTimeFormat("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(item.deadlineUtc)),
  },
  { id: "marks", header: "Marks", cell: (item) => item.maximumMarks },
  {
    id: "submission",
    header: "My submission",
    cell: (item) =>
      item.studentSubmissionStatus ? (
        <StatusBadge
          label={item.studentSubmissionStatus}
          status={item.studentSubmissionStatus.toLowerCase()}
        />
      ) : (
        <span className="text-muted-foreground">Not submitted</span>
      ),
  },
  {
    id: "actions",
    header: "",
    className: "text-right",
    cell: (item) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/student/assignments/${item.id}`}>
          <Eye aria-hidden="true" />
          View
        </Link>
      </Button>
    ),
  },
];
export function StudentAssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, sortDirection] = (
    searchParams.get("sort") ?? "Deadline:Asc"
  ).split(":") as [
    AssignmentFilters["sortBy"],
    AssignmentFilters["sortDirection"],
  ];
  const filters: AssignmentFilters = {
    pageNumber: Math.max(Number(searchParams.get("page")) || 1, 1),
    pageSize: 20,
    search: searchParams.get("search") || undefined,
    status: "Published" as AssignmentStatus,
    courseId: searchParams.get("course") || undefined,
    subjectId: searchParams.get("subject") || undefined,
    deadlineFromUtc: searchParams.get("deadlineFrom") || undefined,
    deadlineToUtc: searchParams.get("deadlineTo") || undefined,
    minimumMarks: Number(searchParams.get("minMarks")) || undefined,
    maximumMarks: Number(searchParams.get("maxMarks")) || undefined,
    allowResubmission: searchParams.has("resubmission")
      ? searchParams.get("resubmission") === "true"
      : undefined,
    sortBy,
    sortDirection,
  };
  const [search, setSearch] = useState(filters.search ?? "");
  const query = useQuery({
    queryKey: ["assignments", "student-list", filters],
    queryFn: () => getAssignments(filters),
  });
  function setFilter(name: string, value?: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== "page") next.delete("page");
    router.replace(`/student/assignments?${next}`);
  }
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student"
        title="Assignments"
        description="View published assignments available through your active course enrollments."
      />
      <FilterBar>
        <SearchInput
          value={search}
          placeholder="Search assignments"
          onValueChange={(value) => {
            setSearch(value);
            setFilter("search", value);
          }}
        />
        <AssignmentFilterSelects
          courseId={filters.courseId}
          subjectId={filters.subjectId}
          requiredStatus="Published"
          deadlineFromUtc={filters.deadlineFromUtc}
          deadlineToUtc={filters.deadlineToUtc}
          minimumMarks={filters.minimumMarks}
          maximumMarks={filters.maximumMarks}
          allowResubmission={filters.allowResubmission}
          sort={`${filters.sortBy}:${filters.sortDirection}`}
          scope="student"
          onFilterChange={setFilter}
        />
      </FilterBar>
      {query.isPending ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          description={query.error.message}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data ? (
        <>
          <DataTable
            columns={columns}
            items={query.data.items}
            getRowKey={(item) => item.id}
            emptyTitle="No assignments available"
          />
          <Pagination
            pageNumber={query.data.pageNumber}
            totalPages={query.data.totalPages}
            onPageChange={(page) => setFilter("page", String(page))}
          />
        </>
      ) : null}
    </div>
  );
}
