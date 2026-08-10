"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { createEnrollment } from "../enrollments.api";
import { createEnrollmentSchema } from "../enrollments.schema";
import type { CreateEnrollmentInput, Enrollment } from "../enrollments.types";
import { useEnrollmentOptions } from "../use-enrollment-options";

export function CreateEnrollmentDialog({
  onCreated,
}: {
  onCreated: (enrollment: Enrollment) => void;
}) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string>();
  const options = useEnrollmentOptions();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEnrollmentInput>({
    resolver: zodResolver(createEnrollmentSchema),
    defaultValues: { studentId: "", courseId: "" },
  });
  const submit = handleSubmit(async (input) => {
    setFormError(undefined);
    try {
      const result = await createEnrollment(input);
      reset();
      setOpen(false);
      onCreated(result);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "The enrollment could not be created.",
      );
    }
  });
  const fields =
    options.students.data && options.courses.data
      ? [
          {
            name: "studentId" as const,
            label: "Student",
            placeholder: "Select student",
            options: options.students.data.items.map((x) => ({
              id: x.id,
              label: `${x.fullName} · ${x.email}`,
            })),
          },
          {
            name: "courseId" as const,
            label: "Course",
            placeholder: "Select course",
            options: options.courses.data.items.map((x) => ({
              id: x.id,
              label: `${x.code} · ${x.name}`,
            })),
          },
        ]
      : [];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add enrollment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create enrollment</DialogTitle>
          <DialogDescription>
            Enroll an active student in an active course.
          </DialogDescription>
        </DialogHeader>
        {options.isPending ? (
          <p className="text-muted-foreground text-sm">
            Loading students and courses…
          </p>
        ) : options.error ? (
          <p className="text-destructive text-sm">{options.error.message}</p>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            {formError ? (
              <p className="text-destructive text-sm">{formError}</p>
            ) : null}
            {fields.map((item) => (
              <Controller
                key={item.name}
                name={item.name}
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>{item.label}</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-label={item.label}>
                        <SelectValue placeholder={item.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {item.options.map((x) => (
                          <SelectItem key={x.id} value={x.id}>
                            {x.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[item.name] ? (
                      <p className="text-destructive text-sm">
                        {errors[item.name]?.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            ))}
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Enrolling…" : "Create enrollment"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
