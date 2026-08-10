import { describe, expect, it } from "vitest";
import { gradeSubmissionSchema } from "./submissions.schema";
describe("grade validation", () => {
  const schema = gradeSubmissionSchema(100);
  it("accepts marks within the assignment maximum", () => {
    expect(
      schema.safeParse({
        marksAwarded: 85,
        feedback: "Good work",
        publishGrade: true,
      }).success,
    ).toBe(true);
  });
  it.each([-1, 101])("rejects invalid marks: %s", (marksAwarded) => {
    expect(
      schema.safeParse({ marksAwarded, feedback: "", publishGrade: true })
        .success,
    ).toBe(false);
  });
});
