import { z } from "zod";

export const userRoleSchema = z.enum(["Admin", "Teacher", "Student"]);

const userFields = {
  email: z.email("Enter a valid email address.").max(256),
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  role: userRoleSchema,
};

const validateGenerationFields = (
  value: {
    role: z.infer<typeof userRoleSchema>;
    studentCourseId?: string;
    codeYear?: string;
    codeSemester?: string;
  },
  context: z.RefinementCtx,
) => {
  if (value.role === "Student" && !value.studentCourseId) {
    context.addIssue({
      code: "custom",
      path: ["studentCourseId"],
      message: "Course is required.",
    });
  }
  if (value.role !== "Admin" && !/^\d{2}$/.test(value.codeYear ?? "")) {
    context.addIssue({
      code: "custom",
      path: ["codeYear"],
      message: "Enter a two-digit year.",
    });
  }
  if (value.role !== "Admin" && !/^\d{2}$/.test(value.codeSemester ?? "")) {
    context.addIssue({
      code: "custom",
      path: ["codeSemester"],
      message: "Enter a two-digit semester code.",
    });
  }
};

export const createUserSchema = z
  .object({
    ...userFields,
    password: z.string().min(8, "Password must be at least 8 characters."),
    studentCourseId: z.string().optional(),
    codeYear: z.string().optional(),
    codeSemester: z.string().optional(),
  })
  .superRefine(validateGenerationFields);

export const updateUserSchema = z.object({
  ...userFields,
  studentCode: z.string().trim().max(30).optional(),
  teacherCode: z.string().trim().max(30).optional(),
  isActive: z.boolean(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});
