import { z } from "zod";
export const submissionSchema = z.object({
  answerText: z.string().trim().min(1, "Answer is required.").max(50000),
});
export function gradeSubmissionSchema(maximumMarks: number) {
  return z.object({
    marksAwarded: z
      .number()
      .min(0)
      .max(maximumMarks, `Marks cannot exceed ${maximumMarks}.`),
    feedback: z.string().trim().max(10000).optional(),
    publishGrade: z.boolean(),
  });
}
