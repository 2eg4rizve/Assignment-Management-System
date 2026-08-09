"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { UserRole } from "@/shared/api/contracts";
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

import { createUser, getUsers } from "../users.api";
import type { UserFilters, UserListItem } from "../users.types";
import { CreateUserDialog } from "./create-user-dialog";

const columns: readonly DataTableColumn<UserListItem>[] = [
  {
    id: "name",
    header: "Name",
    cell: (user) => (
      <div>
        <p className="font-medium">{user.fullName}</p>
        <p className="text-muted-foreground text-xs">{user.email}</p>
      </div>
    ),
  },
  { id: "role", header: "Role", cell: (user) => user.roles.join(", ") },
  {
    id: "status",
    header: "Status",
    cell: (user) => (
      <StatusBadge
        label={user.isActive ? "Active" : "Inactive"}
        status={user.isActive ? "active" : "inactive"}
      />
    ),
  },
  {
    id: "created",
    header: "Created",
    cell: (user) =>
      new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(
        new Date(user.createdAtUtc),
      ),
  },
  {
    id: "actions",
    header: "",
    className: "text-right",
    cell: (user) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/users/${user.id}`}>
          <Eye aria-hidden="true" />
          View
        </Link>
      </Button>
    ),
  },
];

export function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const filters: UserFilters = {
    pageNumber: Math.max(Number(searchParams.get("page")) || 1, 1),
    pageSize: 20,
    search: searchParams.get("search") || undefined,
    role: (searchParams.get("role") as UserRole | null) ?? undefined,
    isActive: searchParams.has("active")
      ? searchParams.get("active") === "true"
      : undefined,
  };
  const [search, setSearch] = useState(filters.search ?? "");
  const query = useQuery({
    queryKey: ["users", "list", filters],
    queryFn: () => getUsers(filters),
  });

  function setFilter(name: string, value?: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== "page") next.delete("page");
    router.replace(`/admin/users?${next}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <CreateUserDialog
            createUser={createUser}
            onCreated={() =>
              void queryClient.invalidateQueries({ queryKey: ["users"] })
            }
          />
        }
        description="Create accounts, assign roles, and control account access."
        eyebrow="Administration"
        title="Users"
      />
      <FilterBar>
        <SearchInput
          onValueChange={(value) => {
            setSearch(value);
            setFilter("search", value);
          }}
          placeholder="Search name or email"
          value={search}
        />
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Select
            onValueChange={(value) =>
              setFilter("role", value === "all" ? undefined : value)
            }
            value={filters.role ?? "all"}
          >
            <SelectTrigger aria-label="Filter by role" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Teacher">Teacher</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            onValueChange={(value) =>
              setFilter("active", value === "all" ? undefined : value)
            }
            value={
              filters.isActive === undefined ? "all" : String(filters.isActive)
            }
          >
            <SelectTrigger aria-label="Filter by status" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>
      {query.isPending ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          description={query.error.message}
          onRetry={() => void query.refetch()}
          traceId={
            query.error instanceof Object && "traceId" in query.error
              ? String(query.error.traceId ?? "")
              : undefined
          }
        />
      ) : null}
      {query.data ? (
        <>
          <DataTable
            columns={columns}
            getRowKey={(user) => user.id}
            items={query.data.items}
          />
          <Pagination
            onPageChange={(page) => setFilter("page", String(page))}
            pageNumber={query.data.pageNumber}
            totalPages={query.data.totalPages}
          />
        </>
      ) : null}
    </div>
  );
}
