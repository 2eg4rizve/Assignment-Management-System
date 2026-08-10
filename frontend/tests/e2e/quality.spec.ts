import { expect, test } from "@playwright/test";
import { emptyDashboard, mockSession } from "./helpers";

for (const role of ["Admin", "Teacher", "Student"] as const) {
  test(`${role} dashboard supports zero data and keyboard navigation`, async ({
    page,
  }) => {
    await mockSession(page, role);
    await page.route(`**/api/dashboard/${role.toLowerCase()}`, async (route) =>
      route.fulfill({ json: emptyDashboard[role] }),
    );
    await page.goto(`/${role.toLowerCase()}/dashboard`);
    await expect(
      page.getByRole("heading", { name: "Welcome, Demo" }),
    ).toBeVisible();
    const dashboardLink = page.getByRole("link", { name: "Dashboard" });
    await dashboardLink.focus();
    await page.keyboard.press("Tab");
    const nextLink = role === "Admin" ? "Users" : "Assignments";
    await expect(
      page.getByRole("link", { name: nextLink, exact: true }),
    ).toBeFocused();
  });
}

test("role guard denies cross-role page access", async ({ page }) => {
  await mockSession(page, "Student");
  await page.goto("/admin/users");
  await expect(
    page.getByRole("heading", { name: "Access unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to dashboard" }),
  ).toHaveAttribute("href", "/student/dashboard");
});

test("expired session returns to login", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "ams_access_token",
      value: "expired",
      url: "http://127.0.0.1:3000",
    },
  ]);
  await page.route("**/api/auth/me", async (route) =>
    route.fulfill({
      status: 401,
      json: { title: "Unauthorized", status: 401 },
    }),
  );
  await page.goto("/student/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("dashboard network failure offers retry", async ({ page }) => {
  await mockSession(page, "Teacher");
  await page.route("**/api/dashboard/teacher", async (route) =>
    route.fulfill({
      status: 503,
      json: {
        title: "Unavailable",
        status: 503,
        detail: "Dashboard service is unavailable.",
      },
    }),
  );
  await page.goto("/teacher/dashboard");
  await expect(
    page.getByText("Dashboard service is unavailable."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
});

test("mobile shell exposes and closes navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSession(page, "Student");
  await page.route("**/api/dashboard/student", async (route) =>
    route.fulfill({ json: emptyDashboard.Student }),
  );
  await page.route("**/api/assignments?*", async (route) =>
    route.fulfill({
      json: {
        items: [],
        pageNumber: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    }),
  );
  await page.goto("/student/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Assignments" }).click();
  await expect(page).toHaveURL(/\/student\/assignments/);
});
