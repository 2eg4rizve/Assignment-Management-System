"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { getCourses } from "@/features/courses/courses.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { createUserSchema } from "../users.schema";
import type { CreateUserInput, UserDetail } from "../users.types";
import { FormField, UserFormFields } from "./user-form-fields";
import { mapUserFormError } from "./user-form-error";

type CreateUserDialogProps = {
  createUser: (input: CreateUserInput) => Promise<UserDetail>;
  onCreated: () => void;
};

export function CreateUserDialog({
  createUser,
  onCreated,
}: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string>();
  const courses = useQuery({
    queryKey: ["courses", "student-id-options"],
    queryFn: () => getCourses({ pageNumber: 1, pageSize: 100, isActive: true }),
    enabled: open,
  });
  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<CreateUserInput>({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "Student",
      studentCourseId: "",
      codeYear: "",
      codeSemester: "",
    },
    resolver: zodResolver(createUserSchema),
  });
  const role = useWatch({ control, name: "role" });

  const submit = handleSubmit(async (values) => {
    setFormError(undefined);
    try {
      await createUser(values);
      reset();
      setOpen(false);
      onCreated();
    } catch (error) {
      setFormError(mapUserFormError(error, setError));
    }
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add user
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add an account and assign its initial role.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" id="create-user-form" onSubmit={submit}>
          {formError ? (
            <p className="text-destructive text-sm">{formError}</p>
          ) : null}
          <UserFormFields
            errors={{
              email: errors.email?.message,
              firstName: errors.firstName?.message,
              lastName: errors.lastName?.message,
              role: errors.role?.message,
            }}
            register={(name) => register(name)}
            role={role}
            setRole={(role) => setValue("role", role)}
          />
          {role === "Student" ? (
            <div className="space-y-2">
              <Label>Course for Student ID</Label>
              <Select
                onValueChange={(value) => setValue("studentCourseId", value)}
              >
                <SelectTrigger aria-label="Course for Student ID">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.data?.items.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} · {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studentCourseId ? (
                <p className="text-destructive text-sm">
                  {errors.studentCourseId.message}
                </p>
              ) : null}
            </div>
          ) : null}
          {role === "Student" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                error={errors.codeYear?.message}
                htmlFor="codeYear"
                label="Admission year"
              >
                <Input
                  id="codeYear"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="26"
                  {...register("codeYear")}
                />
              </FormField>
              <FormField
                error={errors.codeSemester?.message}
                htmlFor="codeSemester"
                label="Semester code"
              >
                <Input
                  id="codeSemester"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="30"
                  {...register("codeSemester")}
                />
              </FormField>
            </div>
          ) : null}
          <FormField
            error={errors.password?.message}
            htmlFor="temporarypassword"
            label="Temporary password"
          >
            <Input
              id="temporarypassword"
              type="password"
              {...register("password")}
            />
          </FormField>
        </form>
        <DialogFooter>
          <Button disabled={isSubmitting} form="create-user-form" type="submit">
            {isSubmitting ? "Creating…" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
