"use client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/shared/components/data-table/status-badge";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { getAssignment } from "../assignments.api";

export function AdminAssignmentDetailPage({ id }: { id: string }) {
  const query = useQuery({
    queryKey: ["assignments", "detail", id],
    queryFn: () => getAssignment(id),
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
        <Link href="/admin/assignments">
          <ArrowLeft aria-hidden="true" />
          Back to assignments
        </Link>
      </Button>
      <PageHeader
        eyebrow={`${query.data.course.code} · ${query.data.subject.code}`}
        title={query.data.title}
        description={`Created by ${query.data.teacher.fullName}`}
        actions={
          <StatusBadge
            label={query.data.status}
            status={query.data.status.toLowerCase()}
          />
        }
      />
      <div className="bg-card space-y-6 rounded-xl border p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">Deadline</p>
            <p className="mt-1 font-medium">
              {new Intl.DateTimeFormat("en-BD", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(new Date(query.data.deadlineUtc))}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Maximum marks</p>
            <p className="mt-1 font-medium">{query.data.maximumMarks}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Resubmission</p>
            <p className="mt-1 font-medium">
              {query.data.allowResubmission ? "Allowed" : "Not allowed"}
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
