"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "@/shared/api/api-error";
import { isValidationProblemDetails } from "@/shared/api/contracts";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { updateSubjectSchema } from "../subjects.schema";
import type { Subject, UpdateSubjectInput } from "../subjects.types";

function Field({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

export function SubjectForm({
  subject,
  onSaved,
  save,
}: {
  subject?: Subject;
  onSaved: (subject: Subject) => void;
  save: (input: UpdateSubjectInput) => Promise<Subject>;
}) {
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSubjectInput>({
    resolver: zodResolver(updateSubjectSchema),
    defaultValues: {
      code: subject?.code ?? "",
      name: subject?.name ?? "",
      description: subject?.description ?? "",
      isActive: subject?.isActive ?? true,
    },
  });
  const submit = handleSubmit(async (values) => {
    setFormError(undefined);
    try {
      onSaved(await save(values));
    } catch (error) {
      if (
        error instanceof ApiError &&
        isValidationProblemDetails(error.problem)
      ) {
        for (const [field, messages] of Object.entries(error.problem.errors))
          setError(
            (field[0].toLowerCase() +
              field.slice(1)) as keyof UpdateSubjectInput,
            { message: messages[0] },
          );
      }
      setFormError(
        error instanceof Error
          ? error.message
          : "The subject could not be saved.",
      );
    }
  });
  return (
    <form
      className="bg-card space-y-5 rounded-xl border p-6 shadow-sm"
      onSubmit={submit}
    >
      {formError ? (
        <p className="text-destructive text-sm">{formError}</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.code?.message} label="Subject code">
          <Input {...register("code")} />
        </Field>
        <Field error={errors.name?.message} label="Subject name">
          <Input {...register("name")} />
        </Field>
      </div>
      <Field error={errors.description?.message} label="Description">
        <textarea
          className="border-input bg-background focus-visible:ring-ring min-h-28 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          {...register("description")}
        />
      </Field>
      {subject ? (
        <label className="flex items-center gap-3 text-sm font-medium">
          <input className="size-4" type="checkbox" {...register("isActive")} />
          Subject is active
        </label>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving…" : subject ? "Save changes" : "Create subject"}
      </Button>
    </form>
  );
}
