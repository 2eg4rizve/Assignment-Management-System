"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { loginSchema, type LoginFormValues } from "../auth.schema";

type LoginResult = {
  detail?: string;
  redirectTo?: string;
  title?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as LoginResult;

      if (!response.ok) {
        setFormError(
          result.detail ??
            (response.status === 401
              ? "The email or password is incorrect."
              : (result.title ?? "Sign in could not be completed.")),
        );
        return;
      }

      router.replace(result.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setFormError(
        "The sign-in service is unavailable. Check that the backend is running.",
      );
    }
  });

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to sign in</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          id="email"
          type="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          aria-invalid={Boolean(errors.password)}
          autoComplete="current-password"
          id="password"
          type="password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        ) : null}
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : null}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
