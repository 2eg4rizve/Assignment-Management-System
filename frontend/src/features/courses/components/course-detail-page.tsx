"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Archive } from "lucide-react";
import Link from "next/link";
import { getCourse, updateCourse, deactivateCourse } from "../courses.api";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { ConfirmDialog } from "@/shared/components/forms/confirm-dialog";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { StatusBadge } from "@/shared/components/data-table/status-badge";
import { CourseForm } from "./course-form";

export function CourseDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["courses", "detail", id],
    queryFn: () => getCourse(id),
  });
  const deactivate = useMutation({
    mutationFn: () => deactivateCourse(id),
    onSuccess: () => {
      void query.refetch();
      void queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
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
        <Link href="/admin/courses">
          <ArrowLeft aria-hidden="true" />
          Back to courses
        </Link>
      </Button>
      <PageHeader
        eyebrow={query.data.code}
        title={query.data.name}
        description={`${query.data.studentCount} students · ${query.data.subjectTeacherCount} subject teachers`}
        actions={
          <>
            <StatusBadge
              label={query.data.isActive ? "Active" : "Inactive"}
              status={query.data.isActive ? "active" : "inactive"}
            />
            {query.data.isActive ? (
              <ConfirmDialog
                title="Deactivate course?"
                description="The course will no longer be available for active academic workflows."
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
      <CourseForm
        key={query.data.updatedAtUtc ?? query.data.createdAtUtc}
        course={query.data}
        save={(input) => updateCourse(id, input)}
        onSaved={(course) => {
          queryClient.setQueryData(["courses", "detail", id], course);
          void queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
        }}
      />
    </div>
  );
}
