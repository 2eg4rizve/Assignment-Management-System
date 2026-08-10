"use client";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, FileText, Send } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/features/auth/auth-context";
import { StatusBadge } from "@/shared/components/data-table/status-badge";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { getTeacherDashboard } from "../dashboards.api";
import { SummaryCard } from "./summary-card";

export function TeacherDashboardPage() {
  const user = useCurrentUser();
  const query = useQuery({
    queryKey: ["dashboard", "teacher"],
    queryFn: getTeacherDashboard,
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
      <PageHeader
        eyebrow="Teacher"
        title={`Welcome, ${user.firstName}`}
        description="Track your assignments and submissions awaiting attention."
      />
      <section
        aria-label="Teaching summary"
        className="grid gap-4 sm:grid-cols-3"
      >
        <SummaryCard
          label="Total assignments"
          value={query.data.totalAssignments}
          href="/teacher/assignments"
          icon={FileText}
        />
        <SummaryCard
          label="Published assignments"
          value={query.data.publishedAssignments}
          href="/teacher/assignments?status=Published"
          icon={Send}
        />
        <SummaryCard
          label="Awaiting review"
          value={query.data.submissionsAwaitingReview}
          href="/teacher/submissions?status=Submitted"
          icon={ClipboardCheck}
        />
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Recent submissions</h2>
          <p className="text-muted-foreground text-sm">
            Latest student work from your assignments.
          </p>
        </div>
        {query.data.recentSubmissions.length === 0 ? (
          <EmptyState
            title="No recent submissions"
            description="New student submissions will appear here."
          />
        ) : (
          <div className="bg-card divide-y rounded-xl border shadow-sm">
            {query.data.recentSubmissions.map((item) => (
              <div
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={item.id}
              >
                <div>
                  <p className="font-medium">{item.assignmentTitle}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.studentName} ·{" "}
                    {new Intl.DateTimeFormat("en-BD", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(item.lastSubmittedAtUtc))}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    label={item.status}
                    status={item.status.toLowerCase()}
                  />
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/teacher/submissions/${item.id}/review`}>
                      Review
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
