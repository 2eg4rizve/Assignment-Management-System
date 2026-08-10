import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createTeachingAssignment,
  getTeachingAssignments,
} from "./teaching-assignments.api";
describe("teaching assignments API", () => {
  afterEach(() => vi.restoreAllMocks());
  it("serializes all list filters", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ items: [] }));
    await getTeachingAssignments({
      pageNumber: 2,
      pageSize: 20,
      search: "amina",
      teacherId: "teacher-1",
      courseId: "course-1",
      subjectId: "subject-1",
      isActive: true,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/teaching-assignments?pageNumber=2&pageSize=20&search=amina&teacherId=teacher-1&courseId=course-1&subjectId=subject-1&isActive=true",
    );
  });
  it("posts a new teacher-course-subject connection", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ id: "assignment-1" }));
    const input = {
      teacherId: "teacher-1",
      courseId: "course-1",
      subjectId: "subject-1",
    };
    await createTeachingAssignment(input);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teaching-assignments",
      expect.objectContaining({ method: "POST", body: JSON.stringify(input) }),
    );
  });
});
