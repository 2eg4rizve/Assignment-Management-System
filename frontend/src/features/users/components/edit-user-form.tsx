"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";

import { updateUserSchema } from "../users.schema";
import type { UpdateUserInput, UserDetail } from "../users.types";
import { UserFormFields } from "./user-form-fields";
import { mapUserFormError } from "./user-form-error";

export function EditUserForm({
  onSaved,
  updateUser,
  user,
}: {
  onSaved: (user: UserDetail) => void;
  updateUser: (input: UpdateUserInput) => Promise<UserDetail>;
  user: UserDetail;
}) {
  const [formError, setFormError] = useState<string>();
  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<UpdateUserInput>({
    defaultValues: {
      email: user.email,
      firstName: user.firstName,
      isActive: user.isActive,
      lastName: user.lastName,
      role: user.roles[0] ?? "Student",
    },
    resolver: zodResolver(updateUserSchema),
  });
  const role = useWatch({ control, name: "role" });

  const submit = handleSubmit(async (values) => {
    setFormError(undefined);
    try {
      onSaved(await updateUser(values));
    } catch (error) {
      setFormError(mapUserFormError(error, setError));
    }
  });

  return (
    <form
      className="bg-card space-y-5 rounded-xl border p-6 shadow-sm"
      onSubmit={submit}
    >
      <div>
        <h2 className="font-semibold">Account details</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Update profile, role, or activation status.
        </p>
      </div>
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
      <label className="flex items-center gap-3 text-sm font-medium">
        <input className="size-4" type="checkbox" {...register("isActive")} />
        Account is active
      </label>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
