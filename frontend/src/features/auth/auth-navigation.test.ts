import { describe, expect, it } from "vitest";

import { getNavigationForRoles } from "./auth-navigation";
import { getDashboardPath } from "./auth-routing";

describe("role-based navigation", () => {
  it.each([
    ["Admin", "/admin/dashboard", "Users"],
    ["Teacher", "/teacher/dashboard", "Submissions"],
    ["Student", "/student/dashboard", "My submissions"],
  ] as const)("builds the %s navigation", (role, dashboard, expectedItem) => {
    const navigation = getNavigationForRoles([role]);

    expect(getDashboardPath([role])).toBe(dashboard);
    expect(navigation.map(({ label }) => label)).toContain(expectedItem);
  });

  it("does not duplicate links for repeated roles", () => {
    const navigation = getNavigationForRoles(["Admin", "Admin"]);
    const links = navigation.map(({ href }) => href);

    expect(new Set(links).size).toBe(links.length);
  });
});
