import { z } from "zod";
export const submissionSchema = z.object({
  answerText: z.string().trim().min(1, "Answer is required.").max(50000),
});
