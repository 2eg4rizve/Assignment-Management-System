import { expect, test } from "@playwright/test";

test("redirects an unauthenticated visitor to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(page.getByText("admin@assignment.local")).toBeVisible();
});
