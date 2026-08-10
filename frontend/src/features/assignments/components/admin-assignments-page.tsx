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
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { getAssignments } from "../assignments.api";
import type {
  AssignmentFilters,
  AssignmentListItem,
} from "../assignments.types";

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
  { id: "teacher", header: "Teacher", cell: (item) => item.teacherName },
  {
    id: "deadline",
    header: "Deadline",
    cell: (item) =>
      new Intl.DateTimeFormat("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(item.deadlineUtc)),
  },
  {
    id: "submissions",
    header: "Submissions",
    cell: (item) => item.submissionCount ?? "—",
  },
  {
    id: "status",
    header: "Status",
    cell: (item) => (
      <StatusBadge label={item.status} status={item.status.toLowerCase()} />
    ),
  },
  {
    id: "actions",
    header: "",
    className: "text-right",
    cell: (item) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/assignments/${item.id}`}>
          <Eye aria-hidden="true" />
          View
        </Link>
      </Button>
    ),
  },
];

export function AdminAssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters: AssignmentFilters = {
    pageNumber: Math.max(Number(searchParams.get("page")) || 1, 1),
    pageSize: 20,
    search: searchParams.get("search") || undefined,
    status:
      (searchParams.get("status") as AssignmentStatus | null) ?? undefined,
    sortBy: "Deadline",
    sortDirection: "Asc",
  };
  const [search, setSearch] = useState(filters.search ?? "");
  const query = useQuery({
    queryKey: ["assignments", "admin-list", filters],
    queryFn: () => getAssignments(filters),
  });
  function setFilter(name: string, value?: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== "page") next.delete("page");
    router.replace(`/admin/assignments?${next}`);
  }
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Assignments"
        description="Review assignments across all teachers, courses, and lifecycle states."
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
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) =>
              setFilter("status", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
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
            emptyTitle="No assignments found"
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
