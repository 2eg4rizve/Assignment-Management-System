"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "@/shared/api/api-error";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { gradeSubmissionSchema } from "../submissions.schema";

type GradeValues = {
  marksAwarded: number;
  feedback?: string;
  publishGrade: boolean;
};
export function GradeForm({
  maximumMarks,
  initialFeedback,
  initialMarks,
  onGrade,
}: {
  maximumMarks: number;
  initialFeedback: string | null;
  initialMarks: number | null;
  onGrade: (values: GradeValues) => Promise<unknown>;
}) {
  const [formError, setFormError] = useState<string>();
  const [conflict, setConflict] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GradeValues>({
    resolver: zodResolver(gradeSubmissionSchema(maximumMarks)),
    defaultValues: {
      marksAwarded: initialMarks ?? 0,
      feedback: initialFeedback ?? "",
      publishGrade: true,
    },
  });
  const submit = handleSubmit(async (values) => {
    setFormError(undefined);
    setConflict(false);
    try {
      await onGrade(values);
    } catch (error) {
      setConflict(error instanceof ApiError && error.status === 409);
      setFormError(
        error instanceof Error
          ? error.message
          : "The grade could not be saved.",
      );
    }
  });
  return (
    <form
      className="bg-card space-y-4 rounded-xl border p-6 shadow-sm"
      onSubmit={submit}
    >
      <div>
        <h2 className="font-semibold">Grade submission</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Save internally for continued review or publish it to the student.
        </p>
      </div>
      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {conflict ? "Submission changed" : "Grading failed"}
          </AlertTitle>
          <AlertDescription>
            {conflict
              ? "Reload the submission and review the latest version before grading again."
              : formError}
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="marksAwarded">
          Marks awarded (maximum {maximumMarks})
        </Label>
        <Input
          id="marksAwarded"
          type="number"
          min="0"
          max={maximumMarks}
          step="0.01"
          {...register("marksAwarded", { valueAsNumber: true })}
        />
        {errors.marksAwarded ? (
          <p className="text-destructive text-sm">
            {errors.marksAwarded.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="feedback">Feedback</Label>
        <textarea
          id="feedback"
          className="border-input bg-background focus-visible:ring-ring min-h-36 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          {...register("feedback")}
        />
        {errors.feedback ? (
          <p className="text-destructive text-sm">{errors.feedback.message}</p>
        ) : null}
      </div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          className="size-4"
          type="checkbox"
          {...register("publishGrade")}
        />
        Publish grade to student
      </label>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving…" : "Save grade"}
      </Button>
    </form>
  );
}
