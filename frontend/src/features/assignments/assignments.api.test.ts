import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deleteAssignment,
  getAssignments,
  publishAssignment,
} from "./assignments.api";
import { ApiError } from "@/shared/api/api-error";
describe("assignments API", () => {
  afterEach(() => vi.restoreAllMocks());
  it("serializes teacher list filters", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ items: [] }));
    await getAssignments({
      pageNumber: 1,
      pageSize: 20,
      status: "Draft",
      courseId: "course-1",
      subjectId: "subject-1",
      teacherId: "teacher-1",
      sortBy: "Deadline",
      sortDirection: "Asc",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/assignments?pageNumber=1&pageSize=20&status=Draft&courseId=course-1&subjectId=subject-1&teacherId=teacher-1&sortBy=Deadline&sortDirection=Asc",
    );
  });
  it("publishes with the concurrency token", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ status: "Published" }));
    await publishAssignment("assignment-1", "AAAAAA==");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/assignments/assignment-1/publish",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ rowVersion: "AAAAAA==" }),
      }),
    );
  });
  it("encodes the concurrency token when deleting", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));
    await deleteAssignment("assignment-1", "AAAAAA==");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/assignments/assignment-1?rowVersion=AAAAAA%3D%3D",
    );
  });
  it.each([
    [403, "You do not own this assignment."],
    [409, "The assignment was changed by another user."],
  ])("preserves a %i lifecycle error", async (status, detail) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        {
          title: "Request failed",
          status,
          detail,
          traceId: "assignment-trace",
        },
        { status },
      ),
    );
    await expect(
      publishAssignment("assignment-1", "stale-version"),
    ).rejects.toMatchObject({
      status,
      message: detail,
      traceId: "assignment-trace",
    } satisfies Partial<ApiError>);
  });
});
