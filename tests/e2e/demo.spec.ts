import { expect, test, type Page } from "@playwright/test";

function collectUnexpectedErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("automated demo drives the real CareFlow workflow in 30–45 seconds", async ({ page }) => {
  test.setTimeout(70_000);
  const errors = collectUnexpectedErrors(page);
  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: "Experience CareFlow" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Demo" })).toBeVisible();

  await page.evaluate(() => {
    const root = document.querySelector("[data-demo-status]");
    const stages: string[] = [];
    (window as typeof window & { __careflowDemoStages?: string[] }).__careflowDemoStages = stages;
    if (root) new MutationObserver(() => stages.push(root.getAttribute("data-demo-stage") || "")).observe(root, { attributes: true, attributeFilter: ["data-demo-stage"] });
  });

  const started = Date.now();
  await page.getByRole("button", { name: "Start Demo" }).click();
  await expect(page.locator("[data-demo-status]" )).toHaveAttribute("data-demo-status", "running");
  await expect(page.locator("[data-demo-status]" )).toHaveAttribute("data-demo-status", "completed", { timeout: 55_000 });
  const elapsed = Date.now() - started;

  expect(elapsed).toBeGreaterThanOrEqual(30_000);
  expect(elapsed).toBeLessThanOrEqual(45_000);
  const stages = await page.evaluate(() => (window as typeof window & { __careflowDemoStages?: string[] }).__careflowDemoStages || []);
  expect(stages).toEqual(expect.arrayContaining(["dashboard", "ai", "providers", "appointments", "profile", "closing"]));
  await expect(page.frameLocator("iframe[title='CareFlow live application']").getByText("Synthetic wellness panel")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Smarter Care/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("pause, resume, replay, exit, and isolated reset controls work", async ({ page }) => {
  test.setTimeout(35_000);
  await page.goto("/demo?speed=0.08");
  await page.getByRole("button", { name: "Start Demo" }).click();
  await expect(page.getByRole("button", { name: "Pause Demo" })).toBeVisible();
  await page.getByRole("button", { name: "Pause Demo" }).click();
  await expect(page.locator("[data-demo-status]" )).toHaveAttribute("data-demo-status", "paused");
  const progressBefore = await page.getByRole("progressbar", { name: "Demo progress" }).getAttribute("aria-valuenow");
  await page.waitForTimeout(500);
  await expect(page.getByRole("progressbar", { name: "Demo progress" })).toHaveAttribute("aria-valuenow", progressBefore || "0");
  await page.getByRole("button", { name: "Resume Demo" }).click();
  await expect(page.locator("[data-demo-status]" )).toHaveAttribute("data-demo-status", "completed", { timeout: 25_000 });

  await page.getByRole("button", { name: "Replay Demo" }).first().click();
  await expect(page.locator("[data-demo-status]" )).toHaveAttribute("data-demo-status", "running");
  await expect(page.getByText("CareFlow — Healthcare, Simplified.")).toBeVisible();
  await page.getByRole("button", { name: "Exit Demo" }).click();
  await expect(page).toHaveURL(/\/patient$/);
});
