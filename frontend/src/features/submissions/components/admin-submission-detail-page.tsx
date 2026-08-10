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
export function AdminSubmissionDetailPage({ id }: { id: string }) {
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
        <Link href="/admin/submissions">
          <ArrowLeft aria-hidden="true" />
          Back to submissions
        </Link>
      </Button>
      <PageHeader
        eyebrow={`${query.data.assignment.course.code} · ${query.data.assignment.subject.code}`}
        title={query.data.assignment.title}
        description={`${query.data.student.fullName} · ${query.data.student.email}`}
        actions={
          <StatusBadge
            label={query.data.status}
            status={query.data.status.toLowerCase()}
          />
        }
      />
      <div className="bg-card space-y-6 rounded-xl border p-6 shadow-sm">
        <div>
          <h2 className="font-semibold">Student answer</h2>
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
            {query.data.answerText}
          </p>
        </div>
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Marks</p>
            <p className="font-medium">
              {query.data.marksAwarded === null
                ? "Not graded"
                : `${query.data.marksAwarded} / ${query.data.maximumMarks}`}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Feedback</p>
            <p className="whitespace-pre-wrap">
              {query.data.feedback || "No feedback provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
