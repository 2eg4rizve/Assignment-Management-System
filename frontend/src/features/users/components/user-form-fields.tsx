import type { ComponentProps } from "react";

import type { UserRole } from "@/shared/api/contracts";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type UserFields = {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

type UserFieldName = keyof UserFields;

type UserFormFieldsProps = {
  errors: Partial<Record<UserFieldName, string>>;
  register: (name: UserFieldName) => ComponentProps<"input">;
  role: UserRole;
  setRole: (role: UserRole) => void;
};

export function UserFormFields({
  errors,
  register,
  role,
  setRole,
}: UserFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        error={errors.firstName}
        htmlFor="firstName"
        label="First name"
      >
        <Input id="firstName" {...register("firstName")} />
      </FormField>
      <FormField error={errors.lastName} htmlFor="lastName" label="Last name">
        <Input id="lastName" {...register("lastName")} />
      </FormField>
      <div className="sm:col-span-2">
        <FormField error={errors.email} htmlFor="email" label="Email address">
          <Input id="email" type="email" {...register("email")} />
        </FormField>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Role</Label>
        <Select
          onValueChange={(value) => setRole(value as UserRole)}
          value={role}
        >
          <SelectTrigger aria-label="Role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Teacher">Teacher</SelectItem>
            <SelectItem value="Student">Student</SelectItem>
          </SelectContent>
        </Select>
        {errors.role ? (
          <p className="text-destructive text-sm">{errors.role}</p>
        ) : null}
      </div>
    </div>
  );
}

export function FormField({
  children,
  error,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
