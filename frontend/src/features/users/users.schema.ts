import { z } from "zod";

export const userRoleSchema = z.enum(["Admin", "Teacher", "Student"]);

const userFields = {
  email: z.email("Enter a valid email address.").max(256),
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  role: userRoleSchema,
  studentCode: z.string().trim().max(30).optional(),
  teacherCode: z.string().trim().max(30).optional(),
};

const validateRoleCodes = (
  value: {
    role: z.infer<typeof userRoleSchema>;
    studentCode?: string;
    teacherCode?: string;
  },
  context: z.RefinementCtx,
) => {
  if (value.role === "Student" && !value.studentCode) {
    context.addIssue({
      code: "custom",
      path: ["studentCode"],
      message: "Student ID is required.",
    });
  } else if (
    value.role === "Student" &&
    value.studentCode &&
    !/^[A-Za-z]\d{6}$/.test(value.studentCode)
  ) {
    context.addIssue({
      code: "custom",
      path: ["studentCode"],
      message: "Use a format such as C263001.",
    });
  }
  if (value.role === "Teacher" && !value.teacherCode) {
    context.addIssue({
      code: "custom",
      path: ["teacherCode"],
      message: "Teacher ID is required.",
    });
  } else if (
    value.role === "Teacher" &&
    value.teacherCode &&
    !/^T\d{6}$/i.test(value.teacherCode)
  ) {
    context.addIssue({
      code: "custom",
      path: ["teacherCode"],
      message: "Use a format such as T263001.",
    });
  }
};

export const createUserSchema = z
  .object({
    ...userFields,
    password: z.string().min(8, "Password must be at least 8 characters."),
  })
  .superRefine(validateRoleCodes);

export const updateUserSchema = z
  .object({
    ...userFields,
    isActive: z.boolean(),
  })
  .superRefine(validateRoleCodes);

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});
