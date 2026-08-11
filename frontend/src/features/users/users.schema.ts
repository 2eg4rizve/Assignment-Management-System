import { z } from "zod";

export const userRoleSchema = z.enum(["Admin", "Teacher", "Student"]);

const userFields = {
  email: z.email("Enter a valid email address.").max(256),
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  role: userRoleSchema,
  studentCode: z.string().trim().max(30).optional(),
};

const validateStudentCode = (
  value: { role: z.infer<typeof userRoleSchema>; studentCode?: string },
  context: z.RefinementCtx,
) => {
  if (value.role !== "Student") return;
  if (!value.studentCode) {
    context.addIssue({
      code: "custom",
      path: ["studentCode"],
      message: "Student ID is required.",
    });
  } else if (!/^[A-Za-z]{1,10}-\d{2}-\d{2}-\d{3,5}$/.test(value.studentCode)) {
    context.addIssue({
      code: "custom",
      path: ["studentCode"],
      message: "Use a format such as CSE-26-03-001.",
    });
  }
};

export const createUserSchema = z
  .object({
    ...userFields,
    password: z.string().min(8, "Password must be at least 8 characters."),
  })
  .superRefine(validateStudentCode);

export const updateUserSchema = z
  .object({
    ...userFields,
    isActive: z.boolean(),
  })
  .superRefine(validateStudentCode);

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});
