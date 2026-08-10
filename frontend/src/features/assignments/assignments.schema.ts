import { z } from "zod";
const fields = {
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z.string().trim().min(1, "Description is required.").max(10000),
  deadlineUtc: z
    .string()
    .min(1, "Deadline is required.")
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Enter a valid deadline.",
    ),
  maximumMarks: z.number().min(0.01).max(99999.99),
  allowResubmission: z.boolean(),
};
export const createAssignmentSchema = z.object({
  ...fields,
  teachingAssignmentId: z.string().min(1, "Select a teaching assignment."),
  publishNow: z.boolean(),
});
export const updateAssignmentSchema = z.object({
  ...fields,
  rowVersion: z.string().min(1),
});
