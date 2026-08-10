import { describe, expect, it } from "vitest";
import { submissionSchema } from "./submissions.schema";
describe("submission validation", () => {
  it("requires a non-empty answer", () => {
    expect(submissionSchema.safeParse({ answerText: "   " }).success).toBe(
      false,
    );
  });
  it("accepts a complete answer", () => {
    expect(
      submissionSchema.safeParse({ answerText: "A complete answer" }).success,
    ).toBe(true);
  });
});
