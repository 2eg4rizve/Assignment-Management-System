import { z } from "zod";

const subjectFields = {
  code: z.string().trim().min(1, "Code is required.").max(30),
  name: z.string().trim().min(1, "Name is required.").max(150),
  description: z.string().trim().max(1000).optional(),
};

export const createSubjectSchema = z.object(subjectFields);
export const updateSubjectSchema = z.object({
  ...subjectFields,
  isActive: z.boolean(),
});
