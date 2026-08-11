"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getCourses } from "../courses.api";
import type { Course, CourseFilters } from "../courses.types";
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
import { CreateCourseDialog } from "./create-course-dialog";

const columns: readonly DataTableColumn<Course>[] = [
  {
    id: "course",
    header: "Course",
    cell: (course) => (
      <div>
        <p className="font-medium">{course.code}</p>
        <p className="text-muted-foreground text-xs">{course.name}</p>
      </div>
    ),
  },
  {
    id: "year",
    header: "Academic year",
    cell: (course) => course.academicYear ?? "—",
  },
  { id: "section", header: "Section", cell: (course) => course.section ?? "—" },
  { id: "students", header: "Students", cell: (course) => course.studentCount },
  {
    id: "status",
    header: "Status",
    cell: (course) => (
      <StatusBadge
        label={course.isActive ? "Active" : "Inactive"}
        status={course.isActive ? "active" : "inactive"}
      />
    ),
  },
  {
    id: "action",
    header: "",
    className: "text-right",
    cell: (course) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/courses/${course.id}`}>
          <Eye aria-hidden="true" />
          View
        </Link>
      </Button>
    ),
  },
];

export function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const filters: CourseFilters = {
    pageNumber: Math.max(Number(searchParams.get("page")) || 1, 1),
    pageSize: 20,
    search: searchParams.get("search") || undefined,
    academicYear: searchParams.get("year") || undefined,
    section: searchParams.get("section") || undefined,
    isActive: searchParams.has("active")
      ? searchParams.get("active") === "true"
      : undefined,
  };
  const [search, setSearch] = useState(filters.search ?? "");
  const query = useQuery({
    queryKey: ["courses", "list", filters],
    queryFn: () => getCourses(filters),
  });
  function setFilter(name: string, value?: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== "page") next.delete("page");
    router.replace(`/admin/courses?${next}`);
  }
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Courses"
        description="Manage the academic courses used for teaching and enrollment."
        actions={
          <CreateCourseDialog
            onCreated={() =>
              void queryClient.invalidateQueries({ queryKey: ["courses"] })
            }
          />
        }
      />
      <FilterBar>
        <SearchInput
          value={search}
          placeholder="Search code or name"
          onValueChange={(value) => {
            setSearch(value);
            setFilter("search", value);
          }}
        />
        <div className="space-y-1.5">
          <Label>Academic year</Label>
          <SearchInput
            value={filters.academicYear ?? ""}
            placeholder="All years"
            onValueChange={(value) => setFilter("year", value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={
              filters.isActive === undefined ? "all" : String(filters.isActive)
            }
            onValueChange={(value) =>
              setFilter("active", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Section</Label>
          <SearchInput
            value={filters.section ?? ""}
            placeholder="All sections"
            onValueChange={(value) => setFilter("section", value)}
          />
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
            getRowKey={(course) => course.id}
            emptyTitle="No courses found"
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
