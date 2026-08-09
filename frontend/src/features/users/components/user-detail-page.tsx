"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/shared/components/data-table/status-badge";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";

import { getUser, resetUserPassword, updateUser } from "../users.api";
import { EditUserForm } from "./edit-user-form";
import { ResetPasswordDialog } from "./reset-password-dialog";

export function UserDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["users", "detail", id],
    queryFn: () => getUser(id),
  });

  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return (
      <ErrorState
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );

  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link href="/admin/users">
          <ArrowLeft aria-hidden="true" />
          Back to users
        </Link>
      </Button>
      <PageHeader
        actions={
          <>
            <StatusBadge
              label={query.data.isActive ? "Active" : "Inactive"}
              status={query.data.isActive ? "active" : "inactive"}
            />
            <ResetPasswordDialog
              name={query.data.fullName}
              resetPassword={(password) => resetUserPassword(id, password)}
            />
          </>
        }
        description={query.data.email}
        eyebrow={query.data.roles.join(", ")}
        title={query.data.fullName}
      />
      <EditUserForm
        key={query.data.updatedAtUtc ?? query.data.createdAtUtc}
        onSaved={(user) => {
          queryClient.setQueryData(["users", "detail", id], user);
          void queryClient.invalidateQueries({ queryKey: ["users", "list"] });
        }}
        updateUser={(input) => updateUser(id, input)}
        user={query.data}
      />
    </div>
  );
}
