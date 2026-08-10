import { afterEach, describe, expect, it, vi } from "vitest";
import { createCourse, getCourses } from "./courses.api";

describe("courses API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("serializes course list filters", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
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
    await getCourses({
      pageNumber: 2,
      pageSize: 20,
      search: "cse",
      academicYear: "2026",
      isActive: true,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/courses?pageNumber=2&pageSize=20&search=cse&academicYear=2026&isActive=true",
    );
  });

  it("sends create input through the same-origin endpoint", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ id: "course-1" }));
    await createCourse({
      code: "CSE-101",
      name: "Computer Fundamentals",
      academicYear: "2026",
      section: "A",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/courses",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "CSE-101",
          name: "Computer Fundamentals",
          academicYear: "2026",
          section: "A",
        }),
      }),
    );
  });
});
