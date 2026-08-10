import { expect, test } from "@playwright/test";

const liveEnabled = process.env.LIVE_E2E === "1";

test.describe("live seeded environment", () => {
  test.skip(
    !liveEnabled,
    "Set LIVE_E2E=1 to run against the local API and database.",
  );

  for (const role of ["Admin", "Teacher", "Student"] as const) {
    test(`${role} can sign in and open the dashboard`, async ({ page }) => {
      await page.goto("/login");
      await page
        .getByLabel("Email address")
        .fill(`${role.toLowerCase()}@assignment.local`);
      await page.getByLabel("Password").fill("Demo123!");
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page).toHaveURL(`/${role.toLowerCase()}/dashboard`);
      await expect(
        page.getByRole("heading", { name: `Welcome, Demo` }),
      ).toBeVisible();
    });
  }
});
