"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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
import { getEnrollments } from "../enrollments.api";
import type { Enrollment, EnrollmentFilters } from "../enrollments.types";
import { useEnrollmentOptions } from "../use-enrollment-options";
import { CreateEnrollmentDialog } from "./create-enrollment-dialog";

const columns: readonly DataTableColumn<Enrollment>[] = [
  {
    id: "student",
    header: "Student",
    cell: (x) => (
      <div>
        <p className="font-medium">{x.student.fullName}</p>
        <p className="text-muted-foreground text-xs">{x.student.email}</p>
      </div>
    ),
  },
  {
    id: "course",
    header: "Course",
    cell: (x) => (
      <div>
        <p>{x.course.code}</p>
        <p className="text-muted-foreground text-xs">{x.course.name}</p>
      </div>
    ),
  },
  {
    id: "enrolled",
    header: "Enrolled",
    cell: (x) =>
      new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(
        new Date(x.enrolledAtUtc),
      ),
  },
  {
    id: "status",
    header: "Status",
    cell: (x) => (
      <StatusBadge
        label={x.isActive ? "Active" : "Inactive"}
        status={x.isActive ? "active" : "inactive"}
      />
    ),
  },
  {
    id: "action",
    header: "",
    className: "text-right",
    cell: (x) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/enrollments/${x.id}`}>
          <Eye aria-hidden="true" />
          View
        </Link>
      </Button>
    ),
  },
];
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: readonly { id: string; label: string }[];
  onChange: (value?: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={value ?? "all"}
        onValueChange={(next) => onChange(next === "all" ? undefined : next)}
      >
        <SelectTrigger
          className="w-52"
          aria-label={`Filter by ${label.toLowerCase()}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLowerCase()}s</SelectItem>
          {options.map((x) => (
            <SelectItem key={x.id} value={x.id}>
              {x.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function EnrollmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const options = useEnrollmentOptions();
  const filters: EnrollmentFilters = {
    pageNumber: Math.max(Number(searchParams.get("page")) || 1, 1),
    pageSize: 20,
    search: searchParams.get("search") || undefined,
    studentId: searchParams.get("student") || undefined,
    courseId: searchParams.get("course") || undefined,
    isActive: searchParams.has("active")
      ? searchParams.get("active") === "true"
      : undefined,
  };
  const [search, setSearch] = useState(filters.search ?? "");
  const query = useQuery({
    queryKey: ["enrollments", "list", filters],
    queryFn: () => getEnrollments(filters),
  });
  function setFilter(name: string, value?: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== "page") next.delete("page");
    router.replace(`/admin/enrollments?${next}`);
  }
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Enrollments"
        description="Connect students to the courses they can access."
        actions={
          <CreateEnrollmentDialog
            onCreated={() =>
              void queryClient.invalidateQueries({ queryKey: ["enrollments"] })
            }
          />
        }
      />
      <FilterBar>
        <SearchInput
          value={search}
          placeholder="Search enrollments"
          onValueChange={(value) => {
            setSearch(value);
            setFilter("search", value);
          }}
        />
        {options.students.data ? (
          <FilterSelect
            label="Student"
            value={filters.studentId}
            onChange={(value) => setFilter("student", value)}
            options={options.students.data.items.map((x) => ({
              id: x.id,
              label: x.fullName,
            }))}
          />
        ) : null}
        {options.courses.data ? (
          <FilterSelect
            label="Course"
            value={filters.courseId}
            onChange={(value) => setFilter("course", value)}
            options={options.courses.data.items.map((x) => ({
              id: x.id,
              label: x.code,
            }))}
          />
        ) : null}
        <FilterSelect
          label="Status"
          value={
            filters.isActive === undefined
              ? undefined
              : String(filters.isActive)
          }
          onChange={(value) => setFilter("active", value)}
          options={[
            { id: "true", label: "Active" },
            { id: "false", label: "Inactive" },
          ]}
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
            getRowKey={(x) => x.id}
            emptyTitle="No enrollments found"
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
