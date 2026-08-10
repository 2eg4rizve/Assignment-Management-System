import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deleteAssignment,
  getAssignments,
  publishAssignment,
} from "./assignments.api";
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
      sortBy: "Deadline",
      sortDirection: "Asc",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/assignments?pageNumber=1&pageSize=20&status=Draft&sortBy=Deadline&sortDirection=Asc",
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
});
