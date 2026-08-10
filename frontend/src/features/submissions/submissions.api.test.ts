import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSubmission,
  getMySubmissions,
  getSubmissions,
  gradeSubmission,
  updateSubmission,
  updateSubmissionStatus,
} from "./submissions.api";
describe("student submissions API", () => {
  afterEach(() => vi.restoreAllMocks());
  it("serializes history filters", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ items: [] }));
    await getMySubmissions({
      pageNumber: 2,
      pageSize: 20,
      status: "Graded",
      sortDirection: "Desc",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/my-submissions?pageNumber=2&pageSize=20&status=Graded&sortDirection=Desc",
    );
  });
  it("creates an initial submission", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => Response.json({ id: "submission-1" }));
    await createSubmission("assignment-1", "My answer");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/assignments/assignment-1/submission",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ answerText: "My answer" }),
      }),
    );
  });
  it("resubmits with the latest row version", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ id: "submission-1" }));
    await updateSubmission("assignment-1", "Revised answer", "AAAAAA==");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/assignments/assignment-1/submission",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          answerText: "Revised answer",
          rowVersion: "AAAAAA==",
        }),
      }),
    );
  });
  it("preserves forbidden eligibility details", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        {
          title: "Forbidden",
          status: 403,
          detail:
            "The assignment deadline has passed or another submission is not allowed.",
          traceId: "submission-trace",
        },
        { status: 403 },
      ),
    );
    await expect(
      createSubmission("assignment-1", "My answer"),
    ).rejects.toMatchObject({ status: 403, traceId: "submission-trace" });
  });
  it("serializes teacher submission filters", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ items: [] }));
    await getSubmissions({
      pageNumber: 1,
      pageSize: 20,
      assignmentId: "assignment-1",
      status: "UnderReview",
      sortDirection: "Desc",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/submissions?pageNumber=1&pageSize=20&assignmentId=assignment-1&status=UnderReview&sortDirection=Desc",
    );
  });
  it("carries row versions through review and grade mutations", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => Response.json({ id: "submission-1" }));
    await updateSubmissionStatus("submission-1", "UnderReview", "version-1");
    await gradeSubmission("submission-1", {
      marksAwarded: 90,
      feedback: "Strong work",
      publishGrade: true,
      rowVersion: "version-2",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/submissions/submission-1/review-status",
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      "/api/submissions/submission-1/grade",
    );
    expect(fetchMock.mock.calls[1][1]).toEqual(
      expect.objectContaining({ body: expect.stringContaining("version-2") }),
    );
  });
  it.each([403, 409])("preserves teacher mutation error %i", async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        {
          title: "Mutation failed",
          status,
          detail:
            status === 403
              ? "You do not own this submission."
              : "The submission changed.",
          traceId: "review-trace",
        },
        { status },
      ),
    );
    await expect(
      updateSubmissionStatus("submission-1", "Returned", "stale"),
    ).rejects.toMatchObject({ status, traceId: "review-trace" });
  });
});
