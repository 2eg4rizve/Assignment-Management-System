"use client";
import { useQuery } from "@tanstack/react-query";
import { Award, CalendarClock, FileCheck, FileText } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/features/auth/auth-context";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { getStudentDashboard } from "../dashboards.api";
import { SummaryCard } from "./summary-card";

export function StudentDashboardPage() {
  const user = useCurrentUser();
  const query = useQuery({
    queryKey: ["dashboard", "student"],
    queryFn: getStudentDashboard,
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
        eyebrow="Student"
        title={`Welcome, ${user.firstName}`}
        description="See upcoming work, submission progress, and published grades."
      />
      <section
        aria-label="Study summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          label="Open assignments"
          value={query.data.openAssignments}
          href="/student/assignments"
          icon={FileText}
        />
        <SummaryCard
          label="Due soon"
          value={query.data.dueSoonAssignments}
          href="/student/assignments"
          icon={CalendarClock}
        />
        <SummaryCard
          label="Submitted"
          value={query.data.submittedAssignments}
          href="/student/submissions"
          icon={FileCheck}
        />
        <SummaryCard
          label="Graded"
          value={query.data.gradedSubmissions}
          href="/student/submissions?status=Graded"
          icon={Award}
        />
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Upcoming assignments</h2>
          <p className="text-muted-foreground text-sm">
            Published work ordered by deadline.
          </p>
        </div>
        {query.data.upcomingAssignments.length === 0 ? (
          <EmptyState
            title="Nothing due soon"
            description="You have no upcoming assignments."
          />
        ) : (
          <div className="bg-card divide-y rounded-xl border shadow-sm">
            {query.data.upcomingAssignments.map((item) => (
              <div
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={item.id}
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.courseName} · Due{" "}
                    {new Intl.DateTimeFormat("en-BD", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZoneName: "short",
                    }).format(new Date(item.deadlineUtc))}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/student/assignments/${item.id}`}>
                    View assignment
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
