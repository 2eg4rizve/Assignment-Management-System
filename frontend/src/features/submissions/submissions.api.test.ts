import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSubmission,
  getMySubmissions,
  updateSubmission,
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
      .mockResolvedValue(Response.json({ id: "submission-1" }));
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
});
