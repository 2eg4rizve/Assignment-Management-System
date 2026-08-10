import { z } from "zod";
const fields = {
  teacherId: z.string().min(1, "Select a teacher."),
  courseId: z.string().min(1, "Select a course."),
  subjectId: z.string().min(1, "Select a subject."),
};
export const updateTeachingAssignmentSchema = z.object({
  ...fields,
  isActive: z.boolean(),
});
