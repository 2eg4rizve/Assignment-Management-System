"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import type { PagedResponse } from "@/shared/api/contracts";
import { browserRequest } from "@/shared/api/browser-client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { TeachingAssignment } from "@/features/teaching-assignments/teaching-assignments.types";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
} from "../assignments.schema";
import type {
  AssignmentDetail,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "../assignments.types";

function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function AssignmentForm({
  assignment,
  onSaved,
  save,
}: {
  assignment?: AssignmentDetail;
  onSaved: () => void;
  save: (
    input: CreateAssignmentInput | UpdateAssignmentInput,
  ) => Promise<unknown>;
}) {
  const [formError, setFormError] = useState<string>();
  const options = useQuery({
    queryKey: ["teacher", "teaching-assignments", "options"],
    queryFn: () =>
      browserRequest<PagedResponse<TeachingAssignment>>(
        "/api/teacher/teaching-assignments",
      ),
    enabled: !assignment,
  });
  type FormValues = CreateAssignmentInput & { rowVersion?: string };
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(
      assignment ? updateAssignmentSchema : createAssignmentSchema,
    ) as Resolver<FormValues>,
    defaultValues: {
      teachingAssignmentId: "",
      title: assignment?.title ?? "",
      description: assignment?.description ?? "",
      deadlineUtc: assignment ? localDateTime(assignment.deadlineUtc) : "",
      maximumMarks: assignment?.maximumMarks ?? 100,
      allowResubmission: assignment?.allowResubmission ?? true,
      publishNow: false,
      rowVersion: assignment?.rowVersion,
    },
  });
  const teachingAssignmentId = useWatch({
    control,
    name: "teachingAssignmentId",
  });
  const submit = handleSubmit(async (values) => {
    setFormError(undefined);
    try {
      const common = {
        title: values.title,
        description: values.description,
        deadlineUtc: new Date(values.deadlineUtc).toISOString(),
        maximumMarks: Number(values.maximumMarks),
        allowResubmission: values.allowResubmission,
      };
      await save(
        assignment
          ? { ...common, rowVersion: assignment.rowVersion }
          : {
              ...common,
              teachingAssignmentId: values.teachingAssignmentId,
              publishNow: values.publishNow,
            },
      );
      onSaved();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "The assignment could not be saved.",
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
      {!assignment ? (
        <div className="space-y-1.5">
          <Label>Course and subject</Label>
          <Select
            value={teachingAssignmentId}
            onValueChange={(value) =>
              setValue("teachingAssignmentId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger aria-label="Course and subject">
              <SelectValue
                placeholder={
                  options.isPending
                    ? "Loading options…"
                    : "Select course and subject"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.data?.items.map((x) => (
                <SelectItem key={x.id} value={x.id}>
                  {x.course.code} · {x.subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teachingAssignmentId ? (
            <p className="text-destructive text-sm">
              {errors.teachingAssignmentId.message}
            </p>
          ) : null}
          {options.isError ? (
            <p className="text-destructive text-sm">{options.error.message}</p>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Title</Label>
          <Input {...register("title")} />
          {errors.title ? (
            <p className="text-destructive text-sm">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label>Deadline</Label>
          <Input type="datetime-local" {...register("deadlineUtc")} />
          {errors.deadlineUtc ? (
            <p className="text-destructive text-sm">
              {errors.deadlineUtc.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label>Maximum marks</Label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            {...register("maximumMarks", { valueAsNumber: true })}
          />
          {errors.maximumMarks ? (
            <p className="text-destructive text-sm">
              {errors.maximumMarks.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <textarea
          className="border-input bg-background focus-visible:ring-ring min-h-48 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-destructive text-sm">
            {errors.description.message}
          </p>
        ) : null}
      </div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          className="size-4"
          type="checkbox"
          {...register("allowResubmission")}
        />
        Allow student resubmission
      </label>
      {!assignment ? (
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            className="size-4"
            type="checkbox"
            {...register("publishNow")}
          />
          Publish immediately
        </label>
      ) : null}
      <Button
        disabled={isSubmitting || (!assignment && options.isPending)}
        type="submit"
      >
        {isSubmitting
          ? "Saving…"
          : assignment
            ? "Save changes"
            : "Create assignment"}
      </Button>
    </form>
  );
}
