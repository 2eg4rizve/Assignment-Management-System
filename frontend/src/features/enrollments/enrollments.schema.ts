import { z } from "zod";
export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, "Select a student."),
  courseId: z.string().min(1, "Select a course."),
});
