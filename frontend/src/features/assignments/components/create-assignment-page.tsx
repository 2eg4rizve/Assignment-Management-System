"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/layout/page-header";
import { createAssignment } from "../assignments.api";
import { AssignmentForm } from "./assignment-form";
export function CreateAssignmentPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link href="/teacher/assignments">
          <ArrowLeft aria-hidden="true" />
          Back to assignments
        </Link>
      </Button>
      <PageHeader
        eyebrow="Teacher"
        title="New assignment"
        description="Create a draft or publish it immediately."
      />
      <AssignmentForm
        save={(input) =>
          createAssignment(input as Parameters<typeof createAssignment>[0])
        }
        onSaved={() => router.push("/teacher/assignments")}
      />
    </div>
  );
}
