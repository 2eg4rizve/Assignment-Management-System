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
import { updateCourseSchema } from "../courses.schema";
import type { Course, UpdateCourseInput } from "../courses.types";

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

export function CourseForm({
  course,
  onSaved,
  save,
}: {
  course?: Course;
  onSaved: (course: Course) => void;
  save: (input: UpdateCourseInput) => Promise<Course>;
}) {
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCourseInput>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      code: course?.code ?? "",
      name: course?.name ?? "",
      description: course?.description ?? "",
      academicYear: course?.academicYear ?? "",
      section: course?.section ?? "",
      isActive: course?.isActive ?? true,
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
              field.slice(1)) as keyof UpdateCourseInput,
            { message: messages[0] },
          );
      }
      setFormError(
        error instanceof Error
          ? error.message
          : "The course could not be saved.",
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
        <Field error={errors.code?.message} label="Course code">
          <Input {...register("code")} />
        </Field>
        <Field error={errors.name?.message} label="Course name">
          <Input {...register("name")} />
        </Field>
        <Field error={errors.academicYear?.message} label="Academic year">
          <Input placeholder="2026" {...register("academicYear")} />
        </Field>
        <Field error={errors.section?.message} label="Section">
          <Input placeholder="A" {...register("section")} />
        </Field>
      </div>
      <Field error={errors.description?.message} label="Description">
        <textarea
          className="border-input bg-background focus-visible:ring-ring min-h-28 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          {...register("description")}
        />
      </Field>
      {course ? (
        <label className="flex items-center gap-3 text-sm font-medium">
          <input className="size-4" type="checkbox" {...register("isActive")} />
          Course is active
        </label>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving…" : course ? "Save changes" : "Create course"}
      </Button>
    </form>
  );
}
