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
import { Label } from "@/shared/components/ui/label";
import { submissionSchema } from "../submissions.schema";

export function SubmissionForm({
  initialAnswer = "",
  onSubmit,
  submitLabel,
}: {
  initialAnswer?: string;
  onSubmit: (answer: string) => Promise<unknown>;
  submitLabel: string;
}) {
  const [formError, setFormError] = useState<string>();
  const [conflict, setConflict] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ answerText: string }>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { answerText: initialAnswer },
  });
  const submit = handleSubmit(async ({ answerText }) => {
    setFormError(undefined);
    setConflict(false);
    try {
      await onSubmit(answerText);
    } catch (error) {
      setConflict(error instanceof ApiError && error.status === 409);
      setFormError(
        error instanceof Error
          ? error.message
          : "The submission could not be saved.",
      );
    }
  });
  return (
    <form
      className="bg-card space-y-4 rounded-xl border p-6 shadow-sm"
      onSubmit={submit}
    >
      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {conflict ? "Submission changed" : "Submission failed"}
          </AlertTitle>
          <AlertDescription>
            {conflict
              ? "Another update occurred. Reload this page and review the latest answer before trying again."
              : formError}
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-1.5">
        <Label>Your answer</Label>
        <textarea
          className="border-input bg-background focus-visible:ring-ring min-h-72 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          {...register("answerText")}
        />
        {errors.answerText ? (
          <p className="text-destructive text-sm">
            {errors.answerText.message}
          </p>
        ) : null}
      </div>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
