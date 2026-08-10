import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAdminDashboard,
  getStudentDashboard,
  getTeacherDashboard,
} from "./dashboards.api";

describe("dashboard API", () => {
  afterEach(() => vi.restoreAllMocks());
  it.each([
    ["admin", getAdminDashboard],
    ["teacher", getTeacherDashboard],
    ["student", getStudentDashboard],
  ] as const)(
    "loads the %s dashboard through its same-origin route",
    async (role, load) => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(Response.json({}));
      await load();
      expect(fetchMock.mock.calls[0][0]).toBe(`/api/dashboard/${role}`);
    },
  );
});
