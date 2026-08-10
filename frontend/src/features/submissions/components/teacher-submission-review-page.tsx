"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw, SearchCheck } from "lucide-react";
import Link from "next/link";
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
  getSubmission,
  gradeSubmission,
  updateSubmissionStatus,
} from "../submissions.api";
import { GradeForm } from "./grade-form";

export function TeacherSubmissionReviewPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["submissions", "detail", id],
    queryFn: () => getSubmission(id),
  });
  const refresh = () => {
    void query.refetch();
    void queryClient.invalidateQueries({
      queryKey: ["submissions", "teacher-list"],
    });
  };
  const statusMutation = useMutation({
    mutationFn: ({
      status,
      rowVersion,
    }: {
      status: "UnderReview" | "Returned";
      rowVersion: string;
    }) => updateSubmissionStatus(id, status, rowVersion),
    onSuccess: refresh,
  });
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return (
      <ErrorState
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  const conflict =
    statusMutation.error instanceof ApiError &&
    statusMutation.error.status === 409;
  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link href="/teacher/submissions">
          <ArrowLeft aria-hidden="true" />
          Back to submissions
        </Link>
      </Button>
      <PageHeader
        eyebrow={`${query.data.assignment.course.code} · ${query.data.assignment.subject.code}`}
        title={query.data.assignment.title}
        description={`${query.data.student.fullName} · ${query.data.student.email}`}
        actions={
          <>
            <StatusBadge
              label={query.data.status}
              status={query.data.status.toLowerCase()}
            />
            {query.data.status === "Submitted" ? (
              <ConfirmDialog
                title="Start review?"
                description="Mark this submission as under review."
                confirmLabel="Start review"
                isPending={statusMutation.isPending}
                onConfirm={() =>
                  statusMutation.mutate({
                    status: "UnderReview",
                    rowVersion: query.data.rowVersion,
                  })
                }
                trigger={
                  <Button variant="outline">
                    <SearchCheck aria-hidden="true" />
                    Start review
                  </Button>
                }
              />
            ) : null}
            {query.data.status === "Submitted" ||
            query.data.status === "UnderReview" ? (
              <ConfirmDialog
                title="Return for revision?"
                description="The student can revise the answer when resubmission is allowed and the deadline remains open."
                confirmLabel="Return"
                isPending={statusMutation.isPending}
                onConfirm={() =>
                  statusMutation.mutate({
                    status: "Returned",
                    rowVersion: query.data.rowVersion,
                  })
                }
                trigger={
                  <Button variant="outline">
                    <RotateCcw aria-hidden="true" />
                    Return
                  </Button>
                }
              />
            ) : null}
          </>
        }
      />
      {statusMutation.error ? (
        <Alert variant="destructive">
          <AlertTitle>
            {conflict ? "Submission changed" : "Status update failed"}
          </AlertTitle>
          <AlertDescription>
            {conflict
              ? "Reload the submission and review its latest status before trying again."
              : statusMutation.error.message}
          </AlertDescription>
          {conflict ? (
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => void query.refetch()}
            >
              Reload submission
            </Button>
          ) : null}
        </Alert>
      ) : null}
      <div className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">Last submitted</p>
            <p className="font-medium">
              {new Intl.DateTimeFormat("en-BD", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(query.data.lastSubmittedAtUtc))}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Maximum marks</p>
            <p className="font-medium">{query.data.maximumMarks}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Deadline</p>
            <p className="font-medium">
              {new Intl.DateTimeFormat("en-BD", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(query.data.assignment.deadlineUtc))}
            </p>
          </div>
        </div>
        <div className="border-t pt-4">
          <h2 className="font-semibold">Student answer</h2>
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
            {query.data.answerText}
          </p>
        </div>
      </div>
      <GradeForm
        key={query.data.rowVersion}
        maximumMarks={query.data.maximumMarks}
        initialMarks={query.data.marksAwarded}
        initialFeedback={query.data.feedback}
        onGrade={async (values) => {
          await gradeSubmission(id, {
            ...values,
            rowVersion: query.data.rowVersion,
          });
          refresh();
        }}
      />
    </div>
  );
}
