import { expect, test } from "@playwright/test";

test("patient dashboard and preference dialog remain usable on mobile", async ({ page }) => {
  await page.goto("/patient");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole("link", { name: "Appointments" }).last().click();
  await page.getByRole("button", { name: "Change preferences" }).first().click();
  await expect(page.getByRole("dialog", { name: "Change preferences" })).toBeVisible();
  await page.getByRole("button", { name: "Close preferences" }).click();
});
