"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { getAssignment, updateAssignment } from "../assignments.api";
import { AssignmentForm } from "./assignment-form";
export function EditAssignmentPage({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
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
        <Link href={`/teacher/assignments/${id}`}>
          <ArrowLeft aria-hidden="true" />
          Back to assignment
        </Link>
      </Button>
      <PageHeader
        eyebrow="Teacher"
        title="Edit assignment"
        description="Saving uses the latest loaded concurrency version."
      />
      <AssignmentForm
        assignment={query.data}
        save={(input) =>
          updateAssignment(id, input as Parameters<typeof updateAssignment>[1])
        }
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ["assignments"] });
          router.push(`/teacher/assignments/${id}`);
        }}
      />
    </div>
  );
}
