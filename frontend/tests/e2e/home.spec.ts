import { expect, test } from "@playwright/test";

test("shows the frontend foundation status", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Assignment Management System" }),
  ).toBeVisible();
  await expect(page.getByText("Frontend foundation ready")).toBeVisible();
});
