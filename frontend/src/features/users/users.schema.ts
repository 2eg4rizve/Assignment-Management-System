import { z } from "zod";

export const userRoleSchema = z.enum(["Admin", "Teacher", "Student"]);

const userFields = {
  email: z.email("Enter a valid email address.").max(256),
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  role: userRoleSchema,
};

export const createUserSchema = z.object({
  ...userFields,
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const updateUserSchema = z.object({
  ...userFields,
  isActive: z.boolean(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});
