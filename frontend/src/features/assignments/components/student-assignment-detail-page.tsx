"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { getAssignment } from "../assignments.api";
import {
  createSubmission,
  getSubmissionForAssignment,
  updateSubmission,
} from "@/features/submissions/submissions.api";
import { getSubmissionEligibility } from "@/features/submissions/submission-eligibility";
import { SubmissionForm } from "@/features/submissions/components/submission-form";

export function StudentAssignmentDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const assignment = useQuery({
    queryKey: ["assignments", "detail", id],
    queryFn: () => getAssignment(id),
  });
  const submission = useQuery({
    queryKey: ["submissions", "assignment", id],
    queryFn: () => getSubmissionForAssignment(id),
    enabled: Boolean(assignment.data?.submissionSummary),
  });
  if (assignment.isPending) return <LoadingState />;
  if (assignment.isError)
    return (
      <ErrorState
        description={assignment.error.message}
        onRetry={() => void assignment.refetch()}
      />
    );
  const eligibility = getSubmissionEligibility({
    assignmentStatus: assignment.data.status,
    deadlineUtc: assignment.data.deadlineUtc,
    allowResubmission: assignment.data.allowResubmission,
    submissionStatus: assignment.data.submissionSummary?.status,
  });
  const saved = () => {
    void assignment.refetch();
    void submission.refetch();
    void queryClient.invalidateQueries({
      queryKey: ["assignments", "student-list"],
    });
    void queryClient.invalidateQueries({ queryKey: ["submissions"] });
  };
  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link href="/student/assignments">
          <ArrowLeft aria-hidden="true" />
          Back to assignments
        </Link>
      </Button>
      <PageHeader
        eyebrow={`${assignment.data.course.code} · ${assignment.data.subject.code}`}
        title={assignment.data.title}
        description={`Due ${new Intl.DateTimeFormat("en-BD", { dateStyle: "long", timeStyle: "short" }).format(new Date(assignment.data.deadlineUtc))}`}
      />
      <div className="bg-card space-y-5 rounded-xl border p-6 shadow-sm">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-muted-foreground text-sm">Maximum marks</p>
            <p className="font-semibold">{assignment.data.maximumMarks}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Resubmission</p>
            <p className="font-semibold">
              {assignment.data.allowResubmission ? "Allowed" : "Not allowed"}
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-semibold">Instructions</h2>
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
            {assignment.data.description}
          </p>
        </div>
      </div>
      {submission.isPending && assignment.data.submissionSummary ? (
        <LoadingState />
      ) : null}
      {submission.isError ? (
        <ErrorState
          description={submission.error.message}
          onRetry={() => void submission.refetch()}
        />
      ) : null}
      {eligibility.allowed &&
      (!assignment.data.submissionSummary || submission.data) ? (
        <SubmissionForm
          initialAnswer={submission.data?.answerText}
          submitLabel={submission.data ? "Resubmit answer" : "Submit answer"}
          onSubmit={async (answer) => {
            if (submission.data)
              await updateSubmission(id, answer, submission.data.rowVersion);
            else await createSubmission(id, answer);
            saved();
          }}
        />
      ) : (
        <Alert>
          <AlertTitle>Submission unavailable</AlertTitle>
          <AlertDescription>{eligibility.reason}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
