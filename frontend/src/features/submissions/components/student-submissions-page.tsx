"use client";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { SubmissionStatus } from "@/shared/api/contracts";
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
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { getMySubmissions } from "../submissions.api";
import type {
  SubmissionFilters,
  SubmissionListItem,
} from "../submissions.types";
import { SubmissionFilterControls } from "./submission-filter-controls";

const columns: readonly DataTableColumn<SubmissionListItem>[] = [
  {
    id: "assignment",
    header: "Assignment",
    cell: (item) => (
      <div>
        <p className="font-medium">{item.assignmentTitle}</p>
        <p className="text-muted-foreground text-xs">
          {item.courseName} · {item.subjectName}
        </p>
        {item.isLate ? (
          <p className="text-destructive text-xs">Submitted late</p>
        ) : null}
      </div>
    ),
  },
  {
    id: "submitted",
    header: "Last submitted",
    cell: (item) =>
      new Intl.DateTimeFormat("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(item.lastSubmittedAtUtc)),
  },
  {
    id: "status",
    header: "Status",
    cell: (item) => (
      <StatusBadge label={item.status} status={item.status.toLowerCase()} />
    ),
  },
  {
    id: "marks",
    header: "Marks",
    cell: (item) =>
      item.marksAwarded === null
        ? "—"
        : `${item.marksAwarded} / ${item.maximumMarks}`,
  },
  {
    id: "actions",
    header: "",
    className: "text-right",
    cell: (item) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/student/submissions/${item.id}`}>
          <Eye aria-hidden="true" />
          View
        </Link>
      </Button>
    ),
  },
];
export function StudentSubmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters: SubmissionFilters = {
    pageNumber: Math.max(Number(searchParams.get("page")) || 1, 1),
    pageSize: 20,
    search: searchParams.get("search") || undefined,
    assignmentId: searchParams.get("assignment") || undefined,
    courseId: searchParams.get("course") || undefined,
    subjectId: searchParams.get("subject") || undefined,
    status:
      (searchParams.get("status") as SubmissionStatus | null) ?? undefined,
    isLate: searchParams.has("late")
      ? searchParams.get("late") === "true"
      : undefined,
    hasGrade: searchParams.has("graded")
      ? searchParams.get("graded") === "true"
      : undefined,
    submittedFromUtc: searchParams.get("from") || undefined,
    submittedToUtc: searchParams.get("to") || undefined,
    sortDirection: "Desc",
  };
  const [search, setSearch] = useState(filters.search ?? "");
  const query = useQuery({
    queryKey: ["submissions", "student-list", filters],
    queryFn: () => getMySubmissions(filters),
  });
  function setFilter(name: string, value?: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== "page") next.delete("page");
    router.replace(`/student/submissions?${next}`);
  }
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student"
        title="My submissions"
        description="Review your submitted answers, statuses, marks, and published feedback."
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
        <SubmissionFilterControls
          filters={filters}
          mode="student"
          onFilterChange={setFilter}
        />
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) =>
              setFilter("status", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-44" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="UnderReview">Under review</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
              <SelectItem value="Graded">Graded</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
            emptyTitle="No submissions found"
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
