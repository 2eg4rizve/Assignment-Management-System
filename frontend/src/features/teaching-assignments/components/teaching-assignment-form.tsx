"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@/shared/api/api-error";
import { isValidationProblemDetails } from "@/shared/api/contracts";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { updateTeachingAssignmentSchema } from "../teaching-assignments.schema";
import type {
  TeachingAssignment,
  UpdateTeachingAssignmentInput,
} from "../teaching-assignments.types";
import { useTeachingOptions } from "../use-teaching-options";

function OptionField({
  label,
  error,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { id: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

export function TeachingAssignmentForm({
  assignment,
  onSaved,
  save,
}: {
  assignment?: TeachingAssignment;
  onSaved: (assignment: TeachingAssignment) => void;
  save: (input: UpdateTeachingAssignmentInput) => Promise<TeachingAssignment>;
}) {
  const options = useTeachingOptions();
  const [formError, setFormError] = useState<string>();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTeachingAssignmentInput>({
    resolver: zodResolver(updateTeachingAssignmentSchema),
    defaultValues: {
      teacherId: assignment?.teacher.id ?? "",
      courseId: assignment?.course.id ?? "",
      subjectId: assignment?.subject.id ?? "",
      isActive: assignment?.isActive ?? true,
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
      )
        for (const [field, messages] of Object.entries(error.problem.errors))
          setError(
            (field[0].toLowerCase() +
              field.slice(1)) as keyof UpdateTeachingAssignmentInput,
            { message: messages[0] },
          );
      setFormError(
        error instanceof Error
          ? error.message
          : "The teaching assignment could not be saved.",
      );
    }
  });
  if (options.isPending)
    return (
      <p className="text-muted-foreground text-sm">
        Loading teachers, courses, and subjects…
      </p>
    );
  if (options.error)
    return <p className="text-destructive text-sm">{options.error.message}</p>;
  const fields = [
    {
      name: "teacherId" as const,
      label: "Teacher",
      placeholder: "Select teacher",
      options: options.teachers.data!.items.map((x) => ({
        id: x.id,
        label: [x.teacherCode, x.fullName, x.email].filter(Boolean).join(" · "),
      })),
    },
    {
      name: "courseId" as const,
      label: "Course",
      placeholder: "Select course",
      options: options.courses.data!.items.map((x) => ({
        id: x.id,
        label: `${x.code} · ${x.name}`,
      })),
    },
    {
      name: "subjectId" as const,
      label: "Subject",
      placeholder: "Select subject",
      options: options.subjects.data!.items.map((x) => ({
        id: x.id,
        label: `${x.code} · ${x.name}`,
      })),
    },
  ];
  return (
    <form
      className="bg-card space-y-5 rounded-xl border p-6 shadow-sm"
      onSubmit={submit}
    >
      {formError ? (
        <p className="text-destructive text-sm">{formError}</p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        {fields.map((field) => (
          <Controller
            key={field.name}
            control={control}
            name={field.name}
            render={({ field: input }) => (
              <OptionField
                {...field}
                error={errors[field.name]?.message}
                value={input.value}
                onChange={input.onChange}
              />
            )}
          />
        ))}
      </div>
      {assignment ? (
        <label className="flex items-center gap-3 text-sm font-medium">
          <input className="size-4" type="checkbox" {...register("isActive")} />
          Teaching assignment is active
        </label>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting
          ? "Saving…"
          : assignment
            ? "Save changes"
            : "Create assignment"}
      </Button>
    </form>
  );
}
