import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/", "/demo", "/login", "/responsible-ai", "/patient", "/patient/intake", "/patient/care-result",
  "/patient/providers", "/patient/appointments", "/patient/appointments/demo", "/patient/forms", "/patient/prepare/demo",
  "/patient/profile", "/patient/waitlist", "/staff", "/staff/schedule", "/staff/patients", "/staff/patients/jordan",
  "/staff/tasks", "/staff/waitlist", "/provider", "/provider/patient/jordan", "/analytics",
];

function collectUnexpectedErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
});

test("every application route renders without a browser error", async ({ page }) => {
  const errors = collectUnexpectedErrors(page);
  const interactionCounts: Record<string, number> = {};
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), `${route} returned ${response?.status()}`).toBeTruthy();
    await expect(page.locator("body")).not.toContainText("Something went wrong");
    interactionCounts[route] = await page.locator("a:visible, button:visible, input:visible, select:visible, textarea:visible").count();
  }
  console.log(`[interaction-inventory] ${JSON.stringify({ routes: routes.length, total: Object.values(interactionCounts).reduce((sum, count) => sum + count, 0), byRoute: interactionCounts })}`);
  expect(errors).toEqual([]);
});

test("landing navigation and role selection reach intended pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore demo" }).first().click();
  await expect(page).toHaveURL(/\/demo$/);
  await page.getByRole("link", { name: "Back to overview" }).click();
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByRole("link", { name: "Continue as Patient" }).click();
  await expect(page.getByRole("heading", { name: /Good afternoon, Jordan/ })).toBeVisible();
  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(page.getByText("Demo notifications")).toBeVisible();
});

test("Find Care chat handles Enter, demo replies, safety, and clearing", async ({ page }) => {
  await page.goto("/patient/intake");
  await expect(page.getByText("Demo navigation", { exact: true })).toBeVisible();
  const input = page.getByLabel("Message CareFlow");
  await input.fill("I need a dermatologist near Joplin within 75 miles");
  await input.press("Enter");
  await expect(page.getByText(/Demo navigation captured Dermatology near Joplin/)).toBeVisible();
  await input.fill("I have severe chest pain");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/call local emergency services/i)).toBeVisible();
  await page.getByRole("button", { name: "Clear conversation" }).click();
  await expect(page.getByText("I have severe chest pain")).toHaveCount(0);
});

test("provider search filters a cross-state hospital and updates details and favorites", async ({ page }) => {
  await page.goto("/patient/providers");
  await expect(page.getByText(/demo result/)).toBeVisible();
  await page.getByLabel("ZIP code").fill("64801");
  await page.getByLabel("Result type").selectOption("Hospital");
  await page.getByRole("button", { name: /Search/ }).click();
  await expect(page.getByRole("heading", { name: "Four State General Hospital (Demo)" })).toBeVisible();
  await page.getByRole("button", { name: "Provider details" }).click();
  await expect(page.getByText("Directory details")).toBeVisible();
  await page.getByRole("button", { name: "Save to favorites" }).click();
  await expect(page.getByRole("button", { name: "Remove from favorites" })).toBeVisible();
});

test("appointment preferences and demo request persist, then cancellation updates status", async ({ page }) => {
  await page.goto("/patient/appointments");
  await page.getByRole("button", { name: "Change preferences" }).first().click();
  await page.getByLabel("Maximum travel distance").fill("75");
  await page.getByLabel("Preferred time").selectOption("Morning");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByText("Preferences saved and recommendations refreshed")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Within 75 miles")).toBeVisible();
  await expect(page.getByText("Morning", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Request demo slot" }).first().click();
  await page.getByRole("link", { name: "View request status" }).first().click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Cancel request" }).click();
  await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
});

test("profile edits, record categories, settings, and document lifecycle work", async ({ page }) => {
  await page.goto("/patient/profile");
  await page.getByLabel("Preferred name").fill("Jordy");
  await page.getByRole("button", { name: "Save personal information" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Jordy" })).toBeVisible();

  await page.getByRole("button", { name: "Lab results" }).click();
  await page.getByLabel("Name").fill("Synthetic CBC");
  await page.getByLabel("Details").fill("Patient-entered demo result");
  await page.getByRole("button", { name: /Add patient-entered record/ }).click();
  await expect(page.getByText("Synthetic CBC")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Remove Synthetic CBC" }).click();
  await expect(page.getByText("Synthetic CBC")).toHaveCount(0);

  await page.getByRole("button", { name: "Documents" }).click();
  const fileName = `synthetic-result-${Date.now()}.txt`;
  await page.getByLabel(/PDF, PNG, JPEG, or TXT/).setInputFiles({ name: fileName, mimeType: "text/plain", buffer: Buffer.from("Synthetic CareFlow test document") });
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByText(fileName)).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: `Remove ${fileName}` }).click();
  await expect(page.getByText(fileName)).toHaveCount(0);

  await page.getByRole("button", { name: "Settings" }).click();
  const sms = page.getByRole("checkbox", { name: /Text notifications/ });
  await sms.check();
  await page.reload();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("checkbox", { name: /Text notifications/ })).toBeChecked();
});

test("staff search opens the selected patient and workflow state persists", async ({ page }) => {
  await page.goto("/staff/patients");
  const patientSearch = page.getByLabel("Search patients");
  await patientSearch.click();
  await patientSearch.pressSequentially("Avery");
  await expect(page.getByRole("row", { name: /Avery Morgan/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Jordan Lee/ })).toHaveCount(0);
  await page.getByRole("row", { name: /Avery Morgan/ }).click();
  await expect(page.getByRole("heading", { name: "Avery Morgan" })).toBeVisible();
  await page.getByRole("button", { name: "Mark reviewed" }).click();
  await expect(page.getByRole("button", { name: "Reviewed" })).toBeDisabled();

  await page.goto("/staff/tasks");
  await page.getByRole("button", { name: "Resolve" }).first().click();
  await expect(page.getByRole("button", { name: "Resolved" }).first()).toBeDisabled();
  await page.reload();
  await expect(page.getByRole("button", { name: "Resolved" }).first()).toBeDisabled();

  await page.goto("/staff/waitlist");
  await page.getByRole("button", { name: "Prepare top demo offer" }).click();
  await expect(page.getByRole("button", { name: "Top offer prepared" })).toBeDisabled();
});

test("pre-visit form requires acknowledgment and completes preparation", async ({ page }) => {
  await page.goto("/patient/forms");
  const acknowledgment = page.getByRole("checkbox");
  await acknowledgment.uncheck();
  await page.getByRole("button", { name: /Save and complete/ }).click();
  await expect(page).toHaveURL(/\/patient\/forms$/);
  await acknowledgment.check();
  await page.getByRole("button", { name: /Save and complete/ }).click();
  await expect(page).toHaveURL(/\/patient\/prepare\/demo$/);
  await expect(page.getByText("100%", { exact: true })).toBeVisible();
});
