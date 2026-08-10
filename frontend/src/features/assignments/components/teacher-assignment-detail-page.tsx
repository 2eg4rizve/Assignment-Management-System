"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Send, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/shared/api/api-error";
import { StatusBadge } from "@/shared/components/data-table/status-badge";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { ConfirmDialog } from "@/shared/components/forms/confirm-dialog";
import { PageHeader } from "@/shared/components/layout/page-header";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  closeAssignment,
  deleteAssignment,
  getAssignment,
  publishAssignment,
} from "../assignments.api";
import { getAssignmentActions } from "../assignment-lifecycle";

export function TeacherAssignmentDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["assignments", "detail", id],
    queryFn: () => getAssignment(id),
  });
  const refresh = () => {
    void query.refetch();
    void queryClient.invalidateQueries({ queryKey: ["assignments", "list"] });
  };
  const publish = useMutation({
    mutationFn: (version: string) => publishAssignment(id, version),
    onSuccess: refresh,
  });
  const close = useMutation({
    mutationFn: (version: string) => closeAssignment(id, version),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (version: string) => deleteAssignment(id, version),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
      router.push("/teacher/assignments");
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
  const mutationError = publish.error ?? close.error ?? remove.error;
  const conflict =
    mutationError instanceof ApiError && mutationError.status === 409;
  const actions = getAssignmentActions(query.data.status);
  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link href="/teacher/assignments">
          <ArrowLeft aria-hidden="true" />
          Back to assignments
        </Link>
      </Button>
      <PageHeader
        eyebrow={`${query.data.course.code} · ${query.data.subject.code}`}
        title={query.data.title}
        description={`Due ${new Intl.DateTimeFormat("en-BD", { dateStyle: "long", timeStyle: "short", timeZoneName: "short" }).format(new Date(query.data.deadlineUtc))}`}
        actions={
          <>
            <StatusBadge
              label={query.data.status}
              status={query.data.status.toLowerCase()}
            />
            {actions.canEdit ? (
              <Button asChild variant="outline">
                <Link href={`/teacher/assignments/${id}/edit`}>
                  <Edit aria-hidden="true" />
                  Edit
                </Link>
              </Button>
            ) : null}
            {actions.canPublish ? (
              <>
                <ConfirmDialog
                  title="Publish assignment?"
                  description="Students enrolled in this course will be able to see it."
                  confirmLabel="Publish"
                  isPending={publish.isPending}
                  onConfirm={() => publish.mutate(query.data.rowVersion)}
                  trigger={
                    <Button>
                      <Send aria-hidden="true" />
                      Publish
                    </Button>
                  }
                />
                <ConfirmDialog
                  title="Delete draft?"
                  description="This draft will be permanently removed."
                  confirmLabel="Delete"
                  variant="destructive"
                  isPending={remove.isPending}
                  onConfirm={() => remove.mutate(query.data.rowVersion)}
                  trigger={<Button variant="destructive">Delete</Button>}
                />
              </>
            ) : null}
            {actions.canClose ? (
              <ConfirmDialog
                title="Close assignment?"
                description="Students will no longer be able to submit answers."
                confirmLabel="Close"
                isPending={close.isPending}
                onConfirm={() => close.mutate(query.data.rowVersion)}
                trigger={
                  <Button>
                    <Square aria-hidden="true" />
                    Close
                  </Button>
                }
              />
            ) : null}
          </>
        }
      />
      {mutationError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {conflict ? "Assignment changed" : "Action failed"}
          </AlertTitle>
          <AlertDescription>
            {conflict
              ? "Another update occurred. Reload the assignment and review the latest values before trying again."
              : mutationError.message}
          </AlertDescription>
          {conflict ? (
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={refresh}
            >
              Reload assignment
            </Button>
          ) : null}
        </Alert>
      ) : null}
      <div className="bg-card space-y-5 rounded-xl border p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">Maximum marks</p>
            <p className="font-semibold">{query.data.maximumMarks}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Resubmission</p>
            <p className="font-semibold">
              {query.data.allowResubmission ? "Allowed" : "Not allowed"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Published</p>
            <p className="font-semibold">
              {query.data.publishedAtUtc
                ? new Intl.DateTimeFormat("en-BD", {
                    dateStyle: "medium",
                  }).format(new Date(query.data.publishedAtUtc))
                : "Not yet"}
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-semibold">Instructions</h2>
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
            {query.data.description}
          </p>
        </div>
      </div>
    </div>
  );
}
