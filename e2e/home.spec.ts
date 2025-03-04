import { test, expect } from "@playwright/test";

test("home page loads correctly", async ({ page }) => {
  await page.goto("/");

  // Verify page title
  await expect(page).toHaveTitle(/Prism/);

  // Verify main heading is present
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();
});

test("home page is responsive", async ({ page }) => {
  await page.goto("/");

  // Test desktop view
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page).toHaveScreenshot("home-desktop.png");

  // Test mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot("home-mobile.png");
});
