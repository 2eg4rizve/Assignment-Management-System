import { describe, expect, it } from "vitest";
import { createAssignmentSchema } from "./assignments.schema";

describe("assignment form validation", () => {
  const valid = {
    teachingAssignmentId: "teaching-1",
    title: "Week 1",
    description: "Complete the exercise.",
    deadlineUtc: "2026-08-20T12:00",
    maximumMarks: 100,
    allowResubmission: true,
    publishNow: false,
  };

  it("accepts a complete assignment", () => {
    expect(createAssignmentSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing teaching assignment and invalid marks", () => {
    const result = createAssignmentSchema.safeParse({
      ...valid,
      teachingAssignmentId: "",
      maximumMarks: 0,
    });
    expect(result.success).toBe(false);
  });
});
