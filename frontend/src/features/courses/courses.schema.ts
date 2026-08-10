import { z } from "zod";

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).optional();

const courseFields = {
  code: z.string().trim().min(1, "Code is required.").max(30),
  name: z.string().trim().min(1, "Name is required.").max(150),
  description: optionalText(1000),
  academicYear: optionalText(20),
  section: optionalText(30),
};

export const createCourseSchema = z.object(courseFields);
export const updateCourseSchema = z.object({
  ...courseFields,
  isActive: z.boolean(),
});
