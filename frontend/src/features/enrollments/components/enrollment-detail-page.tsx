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
import { deactivateEnrollment, getEnrollment } from "../enrollments.api";
export function EnrollmentDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["enrollments", "detail", id],
    queryFn: () => getEnrollment(id),
  });
  const deactivate = useMutation({
    mutationFn: () => deactivateEnrollment(id),
    onSuccess: () => {
      void query.refetch();
      void queryClient.invalidateQueries({ queryKey: ["enrollments", "list"] });
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
        <Link href="/admin/enrollments">
          <ArrowLeft aria-hidden="true" />
          Back to enrollments
        </Link>
      </Button>
      <PageHeader
        eyebrow={query.data.course.code}
        title={query.data.student.fullName}
        description={`${query.data.student.email} · ${query.data.course.name}`}
        actions={
          <>
            <StatusBadge
              label={query.data.isActive ? "Active" : "Inactive"}
              status={query.data.isActive ? "active" : "inactive"}
            />
            {query.data.isActive ? (
              <ConfirmDialog
                title="Deactivate enrollment?"
                description="The student will lose access provided by this course enrollment."
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
      <div className="bg-card grid gap-5 rounded-xl border p-6 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-sm">Enrolled on</p>
          <p className="mt-1 font-medium">
            {new Intl.DateTimeFormat("en-BD", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(new Date(query.data.enrolledAtUtc))}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Course</p>
          <p className="mt-1 font-medium">
            {query.data.course.code} · {query.data.course.name}
          </p>
        </div>
      </div>
      {deactivate.isError ? (
        <p className="text-destructive text-sm">{deactivate.error.message}</p>
      ) : null}
    </div>
  );
}
