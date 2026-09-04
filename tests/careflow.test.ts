import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { initialCareRequest } from "../lib/demo-data";
import { extractIntake } from "../lib/ai/intake-extraction";
import { navigateCare } from "../lib/ai/care-navigation";
import { buildPreVisitSummary } from "../lib/ai/pre-visit-summary";
import { rankAppointments } from "../lib/scheduling/match";

test("landing and role routes contain the expected product language", async () => {
  const files = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/patient/intake/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/staff/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/provider/patient/[id]/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(files[0], /Healthcare starts before the appointment/);
  assert.match(files[1], /CareFlow cannot evaluate emergencies/);
  assert.match(files[2], /Cancellation recovery/);
  assert.match(files[3], /Patient-reported/);
  assert.doesNotMatch(files.join("\n"), /codex-preview|react-loading-skeleton/i);
});

test("ranks Jordan's expected appointment as the best match", () => {
  const navigation = navigateCare(initialCareRequest);
  const ranked = rankAppointments(initialCareRequest, navigation.category);
  assert.equal(ranked[0].provider.name, "Dr. Maya Patel");
  assert.equal(ranked[0].time, "4:20 PM");
  assert.equal(ranked[0].label, "Best Match");
  assert.ok(ranked[0].reasons.includes("Insurance match"));
  assert.ok(ranked[0].reasons.includes("Fits your preferred time"));
});

test("interrupts intake for explicit emergency-warning language", () => {
  const structured = extractIntake("I have severe chest pain and cannot breathe", { ...initialCareRequest, concern: "", duration: "", emergencyWarning: false });
  const navigation = navigateCare(structured);
  assert.equal(structured.emergencyWarning, true);
  assert.equal(navigation.urgent, true);
  assert.equal(navigation.category, "Needs human review");
  assert.match(navigation.explanation, /immediate professional attention/i);
});

test("pre-visit summary stays patient-reported and non-diagnostic", () => {
  const brief = buildPreVisitSummary(initialCareRequest);
  assert.match(brief.summary, /Patient reports persistent cough for 4 days/i);
  assert.match(brief.safetyStatement, /No emergency warning responses were entered/i);
  assert.doesNotMatch(JSON.stringify(brief), /bronchitis|diagnos|low risk/i);
});
