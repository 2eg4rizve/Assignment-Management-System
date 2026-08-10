"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/shared/components/data-table/status-badge";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { ConfirmDialog } from "@/shared/components/forms/confirm-dialog";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { deactivateSubject, getSubject, updateSubject } from "../subjects.api";
import { SubjectForm } from "./subject-form";

export function SubjectDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["subjects", "detail", id],
    queryFn: () => getSubject(id),
  });
  const deactivate = useMutation({
    mutationFn: () => deactivateSubject(id),
    onSuccess: () => {
      void query.refetch();
      void queryClient.invalidateQueries({ queryKey: ["subjects", "list"] });
    },
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
        <Link href="/admin/subjects">
          <ArrowLeft aria-hidden="true" />
          Back to subjects
        </Link>
      </Button>
      <PageHeader
        eyebrow={query.data.code}
        title={query.data.name}
        description={query.data.description ?? "No description provided."}
        actions={
          <>
            <StatusBadge
              label={query.data.isActive ? "Active" : "Inactive"}
              status={query.data.isActive ? "active" : "inactive"}
            />
            {query.data.isActive ? (
              <ConfirmDialog
                title="Deactivate subject?"
                description="The subject will no longer be available for active teaching assignments."
                confirmLabel="Deactivate"
                variant="destructive"
                isPending={deactivate.isPending}
                onConfirm={() => deactivate.mutate()}
                trigger={
                  <Button variant="destructive">
                    <Archive aria-hidden="true" />
                    Deactivate
                  </Button>
                }
              />
            ) : null}
          </>
        }
      />
      {deactivate.isError ? (
        <p className="text-destructive text-sm">{deactivate.error.message}</p>
      ) : null}
      <SubjectForm
        key={query.data.updatedAtUtc ?? query.data.createdAtUtc}
        subject={query.data}
        save={(input) => updateSubject(id, input)}
        onSaved={(subject) => {
          queryClient.setQueryData(["subjects", "detail", id], subject);
          void queryClient.invalidateQueries({
            queryKey: ["subjects", "list"],
          });
        }}
      />
    </div>
  );
}
