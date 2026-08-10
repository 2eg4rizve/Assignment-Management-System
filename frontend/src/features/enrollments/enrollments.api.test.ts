import { afterEach, describe, expect, it, vi } from "vitest";
import { createEnrollment, getEnrollments } from "./enrollments.api";
describe("enrollments API", () => {
  afterEach(() => vi.restoreAllMocks());
  it("serializes all list filters", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ items: [] }));
    await getEnrollments({
      pageNumber: 2,
      pageSize: 20,
      search: "amina",
      studentId: "student-1",
      courseId: "course-1",
      isActive: true,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/enrollments?pageNumber=2&pageSize=20&search=amina&studentId=student-1&courseId=course-1&isActive=true",
    );
  });
  it("posts a student-course enrollment", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ id: "enrollment-1" }));
    const input = { studentId: "student-1", courseId: "course-1" };
    await createEnrollment(input);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/enrollments",
      expect.objectContaining({ method: "POST", body: JSON.stringify(input) }),
    );
  });
});
