"use client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/shared/components/data-table/status-badge";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { getSubmission } from "../submissions.api";
export function StudentSubmissionDetailPage({ id }: { id: string }) {
  const query = useQuery({
    queryKey: ["submissions", "detail", id],
    queryFn: () => getSubmission(id),
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
        <Link href="/student/submissions">
          <ArrowLeft aria-hidden="true" />
          Back to submissions
        </Link>
      </Button>
      <PageHeader
        eyebrow={`${query.data.assignment.course.code} · ${query.data.assignment.subject.code}`}
        title={query.data.assignment.title}
        description={`Last submitted ${new Intl.DateTimeFormat("en-BD", { dateStyle: "long", timeStyle: "short" }).format(new Date(query.data.lastSubmittedAtUtc))}`}
        actions={
          <StatusBadge
            label={query.data.status}
            status={query.data.status.toLowerCase()}
          />
        }
      />
      <div className="bg-card space-y-6 rounded-xl border p-6 shadow-sm">
        <div>
          <h2 className="font-semibold">Your answer</h2>
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
            {query.data.answerText}
          </p>
        </div>
        {query.data.status === "Graded" ? (
          <div className="border-t pt-5">
            <h2 className="font-semibold">Grade and feedback</h2>
            <p className="mt-2 text-lg font-semibold">
              {query.data.marksAwarded} / {query.data.maximumMarks}
            </p>
            <p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">
              {query.data.feedback || "No feedback provided."}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground border-t pt-5 text-sm">
            Marks and feedback will appear after the grade is published.
          </p>
        )}
      </div>
    </div>
  );
}
