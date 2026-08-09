"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
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

import { resetPasswordSchema } from "../users.schema";
import { mapUserFormError } from "./user-form-error";

type ResetPasswordValues = { newPassword: string };

export function ResetPasswordDialog({
  name,
  resetPassword,
}: {
  name: string;
  resetPassword: (password: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string>();
  const {
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ResetPasswordValues>({
    defaultValues: { newPassword: "" },
    resolver: zodResolver(resetPasswordSchema),
  });

  const submit = handleSubmit(async ({ newPassword }) => {
    setFormError(undefined);
    try {
      await resetPassword(newPassword);
      reset();
    } catch (error) {
      setFormError(mapUserFormError(error, setError));
    }
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <KeyRound aria-hidden="true" />
          Reset password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>Set a new password for {name}.</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" id="reset-password-form" onSubmit={submit}>
          {isSubmitSuccessful ? (
            <p className="text-sm text-emerald-700">
              Password updated successfully.
            </p>
          ) : null}
          {formError ? (
            <p className="text-destructive text-sm">{formError}</p>
          ) : null}
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            {...register("newPassword")}
          />
          {errors.newPassword ? (
            <p className="text-destructive text-sm">
              {errors.newPassword.message}
            </p>
          ) : null}
        </form>
        <DialogFooter>
          <Button
            disabled={isSubmitting}
            form="reset-password-form"
            type="submit"
          >
            {isSubmitting ? "Resetting…" : "Reset password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
