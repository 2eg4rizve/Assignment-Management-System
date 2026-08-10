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
import {
  deactivateTeachingAssignment,
  getTeachingAssignment,
  updateTeachingAssignment,
} from "../teaching-assignments.api";
import { TeachingAssignmentForm } from "./teaching-assignment-form";
export function TeachingAssignmentDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["teaching-assignments", "detail", id],
    queryFn: () => getTeachingAssignment(id),
  });
  const deactivate = useMutation({
    mutationFn: () => deactivateTeachingAssignment(id),
    onSuccess: () => {
      void query.refetch();
      void queryClient.invalidateQueries({
        queryKey: ["teaching-assignments", "list"],
      });
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
        <Link href="/admin/teaching-assignments">
          <ArrowLeft aria-hidden="true" />
          Back to teaching assignments
        </Link>
      </Button>
      <PageHeader
        eyebrow={query.data.course.code}
        title={query.data.teacher.fullName}
        description={`${query.data.subject.name} · ${query.data.course.name}`}
        actions={
          <>
            <StatusBadge
              label={query.data.isActive ? "Active" : "Inactive"}
              status={query.data.isActive ? "active" : "inactive"}
            />
            {query.data.isActive ? (
              <ConfirmDialog
                title="Deactivate teaching assignment?"
                description="This teacher-course-subject connection will no longer be active."
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
      <TeachingAssignmentForm
        key={query.data.updatedAtUtc ?? query.data.createdAtUtc}
        assignment={query.data}
        save={(input) => updateTeachingAssignment(id, input)}
        onSaved={(assignment) => {
          queryClient.setQueryData(
            ["teaching-assignments", "detail", id],
            assignment,
          );
          void queryClient.invalidateQueries({
            queryKey: ["teaching-assignments", "list"],
          });
        }}
      />
    </div>
  );
}
