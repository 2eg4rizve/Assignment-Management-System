import { afterEach, describe, expect, it, vi } from "vitest";
import { getSubmissionEligibility } from "./submission-eligibility";
describe("submission eligibility", () => {
  afterEach(() => vi.useRealTimers());
  it("allows an eligible initial submission", () => {
    vi.setSystemTime(new Date("2026-08-10T10:00:00Z"));
    expect(
      getSubmissionEligibility({
        assignmentStatus: "Published",
        deadlineUtc: "2026-08-11T10:00:00Z",
        allowResubmission: false,
      }),
    ).toEqual({ allowed: true, reason: null });
  });
  it.each([
    [
      {
        assignmentStatus: "Closed" as const,
        deadlineUtc: "2026-08-11T10:00:00Z",
        allowResubmission: true,
      },
      "not open",
    ],
    [
      {
        assignmentStatus: "Published" as const,
        deadlineUtc: "2026-08-09T10:00:00Z",
        allowResubmission: true,
      },
      "deadline",
    ],
    [
      {
        assignmentStatus: "Published" as const,
        deadlineUtc: "2026-08-11T10:00:00Z",
        allowResubmission: false,
        submissionStatus: "Submitted" as const,
      },
      "not allowed",
    ],
    [
      {
        assignmentStatus: "Published" as const,
        deadlineUtc: "2026-08-11T10:00:00Z",
        allowResubmission: true,
        submissionStatus: "Graded" as const,
      },
      "graded",
    ],
  ])("blocks an ineligible submission", (input, message) => {
    vi.setSystemTime(new Date("2026-08-10T10:00:00Z"));
    expect(getSubmissionEligibility(input)).toMatchObject({
      allowed: false,
      reason: expect.stringContaining(message),
    });
  });
});
