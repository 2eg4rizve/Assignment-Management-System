import { afterEach, describe, expect, it, vi } from "vitest";
import { createSubject, getSubjects } from "./subjects.api";

describe("subjects API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("serializes subject list filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        items: [],
        pageNumber: 2,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      }),
    );
    await getSubjects({
      pageNumber: 2,
      pageSize: 20,
      search: "math",
      isActive: false,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/subjects?pageNumber=2&pageSize=20&search=math&isActive=false",
    );
  });

  it("sends create input through the same-origin endpoint", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ id: "subject-1" }));
    const input = {
      code: "MATH-101",
      name: "Mathematics",
      description: "Core mathematics",
    };
    await createSubject(input);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/subjects",
      expect.objectContaining({ method: "POST", body: JSON.stringify(input) }),
    );
  });
});
