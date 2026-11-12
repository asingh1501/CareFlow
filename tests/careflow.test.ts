import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { initialCareRequest } from "../lib/demo-data";
import { extractIntake } from "../lib/ai/intake-extraction";
import { navigateCare } from "../lib/ai/care-navigation";
import { buildPreVisitSummary } from "../lib/ai/pre-visit-summary";
import { rankAppointments } from "../lib/scheduling/match";
import { ProviderSearchError, haversineMiles, searchProviders } from "../lib/providers/search";
import { checkRateLimit, resetRateLimitsForTests, validateChatMessages } from "../lib/ai/chat-validation";
import { detectSafetyInterruption } from "../lib/ai/safety";
import { NextRequest } from "next/server";
import { POST as chatPost } from "../app/api/ai/chat/route";
import { DELETE as documentDelete, GET as documentGet, POST as documentPost } from "../app/api/documents/route";

test("landing and role routes contain the expected product language", async () => {
  const files = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/patient/intake/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/staff/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/provider/patient/[id]/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(files[0], /Healthcare starts before the appointment/);
  assert.match(files[1], /does not diagnose/);
  assert.match(files[2], /Cancellation recovery/);
  assert.match(files[3], /Patient-reported/);
  assert.doesNotMatch(files.join("\n"), /codex-preview|react-loading-skeleton/i);
});

test("uses Haversine distance and returns cross-state results within 100 miles", () => {
  const miles = haversineMiles({ latitude: 36.0626, longitude: -94.1574 }, { latitude: 37.0842, longitude: -94.5133 });
  assert.ok(miles > 60 && miles < 80, `expected Fayetteville to Joplin to be about 70 miles, got ${miles}`);
  const search = searchProviders({ zipCode: "72701", specialty: "Cardiology", radiusMiles: 100 });
  assert.ok(search.results.some((provider) => provider.state === "MO"), "expected a Missouri result across the Arkansas border");
  assert.ok(search.results.every((provider) => provider.distanceMiles === null || provider.distanceMiles <= 100));
  assert.equal(search.mode, "synthetic-demo");
});

test("applies specialty and radius filters without a same-state restriction", () => {
  const search = searchProviders({ zipCode: "72761", specialty: "Dermatology", radiusMiles: 75, format: "In person" });
  assert.ok(search.results.some((provider) => provider.city === "Tahlequah" && provider.state === "OK"));
  assert.ok(search.results.every((provider) => provider.specialty === "Dermatology"));
});

test("filters synthetic directory results by facility type", () => {
  const search = searchProviders({ zipCode: "64801", radiusMiles: 100, kind: "Hospital" });
  assert.ok(search.results.length > 0);
  assert.ok(search.results.every((provider) => provider.kind === "Hospital"));
  assert.ok(search.results.every((provider) => provider.dataSource === "synthetic-demo"));
});

test("rejects invalid and unsupported ZIP codes with useful errors", () => {
  assert.throws(() => searchProviders({ zipCode: "7270", radiusMiles: 100 }), (error) => error instanceof ProviderSearchError && error.code === "INVALID_ZIP");
  assert.throws(() => searchProviders({ zipCode: "99999", radiusMiles: 100 }), (error) => error instanceof ProviderSearchError && error.code === "GEOCODING_FAILED");
});

test("validates multi-turn chat history and request limits", () => {
  const checked = validateChatMessages([{ role: "user", content: "I need a dermatologist" }, { role: "assistant", content: "What location?" }, { role: "user", content: "Fayetteville, AR" }]);
  assert.equal(checked.messages?.length, 3);
  assert.match(validateChatMessages([{ role: "assistant", content: "No user turn" }]).error || "", /final message/i);
  assert.match(validateChatMessages([{ role: "user", content: "x".repeat(4001) }]).error || "", /4,000/);
});

test("rate limiter blocks after the configured request count", () => {
  resetRateLimitsForTests();
  assert.equal(checkRateLimit("test-client", 1000, 2, 60_000).allowed, true);
  assert.equal(checkRateLimit("test-client", 1001, 2, 60_000).allowed, true);
  assert.equal(checkRateLimit("test-client", 1002, 2, 60_000).allowed, false);
});

test("deterministic safety interruption is separate from model output", () => {
  const interruption = detectSafetyInterruption("I have severe chest pain and cannot breathe");
  assert.equal(interruption?.urgent, true);
  assert.match(interruption?.message || "", /emergency services/i);
});

test("AI route reports missing credentials instead of pretending to answer", async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  resetRateLimitsForTests();
  const request = new NextRequest("http://localhost/api/ai/chat", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "missing-key-test" }, body: JSON.stringify({ messages: [{ role: "user", content: "Find a dermatologist near Fayetteville" }] }) });
  const response = await chatPost(request);
  assert.equal(response.status, 503);
  assert.equal(((await response.json()) as { code: string }).code, "MISSING_CREDENTIALS");
  if (previous) process.env.OPENAI_API_KEY = previous;
});

test("AI route intercepts emergency language before credential checks", async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  resetRateLimitsForTests();
  const request = new NextRequest("http://localhost/api/ai/chat", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "safety-test" }, body: JSON.stringify({ messages: [{ role: "user", content: "I have severe chest pain" }] }) });
  const response = await chatPost(request);
  const payload = await response.json() as { mode: string };
  assert.equal(response.status, 200);
  assert.equal(payload.mode, "deterministic-safety");
  if (previous) process.env.OPENAI_API_KEY = previous;
});

test("AI route returns a successful mocked upstream response", async () => {
  const previousKey = process.env.OPENAI_API_KEY; const originalFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = "test-key"; resetRateLimitsForTests();
  globalThis.fetch = async () => new Response(JSON.stringify({ id: "resp_test", object: "response", created_at: 1, status: "completed", model: "test-model", output: [{ id: "msg_test", type: "message", status: "completed", role: "assistant", content: [{ type: "output_text", text: "I can help you search for dermatology care.", annotations: [], logprobs: [] }] }] }), { status: 200, headers: { "content-type": "application/json" } });
  try {
    const request = new NextRequest("http://localhost/api/ai/chat", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "success-test" }, body: JSON.stringify({ messages: [{ role: "user", content: "Find dermatology care" }] }) });
    const response = await chatPost(request); const payload = await response.json() as { mode: string; message: string };
    assert.equal(response.status, 200); assert.equal(payload.mode, "live"); assert.match(payload.message, /dermatology/i);
  } finally { globalThis.fetch = originalFetch; if (previousKey) process.env.OPENAI_API_KEY = previousKey; else delete process.env.OPENAI_API_KEY; }
});

test("AI route displays a safe error when the upstream call fails", async () => {
  const previousKey = process.env.OPENAI_API_KEY; const originalFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = "test-key"; resetRateLimitsForTests();
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: "upstream failure", type: "server_error" } }), { status: 500, headers: { "content-type": "application/json" } });
  try {
    const request = new NextRequest("http://localhost/api/ai/chat", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "failure-test" }, body: JSON.stringify({ messages: [{ role: "user", content: "Find primary care" }] }) });
    const response = await chatPost(request); const payload = await response.json() as { code: string };
    assert.equal(response.status, 502); assert.equal(payload.code, "AI_UPSTREAM_ERROR"); assert.doesNotMatch(JSON.stringify(payload), /test-key/);
  } finally { globalThis.fetch = originalFetch; if (previousKey) process.env.OPENAI_API_KEY = previousKey; else delete process.env.OPENAI_API_KEY; }
});

test("document API enforces ownership, validates uploads, and authorizes download", async () => {
  const unauthorized = await documentGet(new NextRequest("http://localhost/api/documents"));
  assert.equal(unauthorized.status, 401);
  const badForm = new FormData(); badForm.set("file", new File(["bad"], "malware.exe", { type: "application/octet-stream" }));
  const rejected = await documentPost(new NextRequest("http://localhost/api/documents", { method: "POST", headers: { "x-careflow-demo-user": "jordan" }, body: badForm }));
  assert.equal(rejected.status, 415);
  const goodForm = new FormData(); goodForm.set("category", "Lab result"); goodForm.set("file", new File(["synthetic result"], "demo-lab.txt", { type: "text/plain" }));
  const uploaded = await documentPost(new NextRequest("http://localhost/api/documents", { method: "POST", headers: { "x-careflow-demo-user": "jordan" }, body: goodForm }));
  assert.equal(uploaded.status, 201); const metadata = ((await uploaded.json()) as { document: { id: string } }).document;
  const downloaded = await documentGet(new NextRequest(`http://localhost/api/documents?id=${metadata.id}`, { headers: { "x-careflow-demo-user": "jordan" } }));
  assert.equal(downloaded.status, 200); assert.equal(await downloaded.text(), "synthetic result");
  const removed = await documentDelete(new NextRequest(`http://localhost/api/documents?id=${metadata.id}`, { method: "DELETE", headers: { "x-careflow-demo-user": "jordan" } }));
  assert.equal(removed.status, 200);
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
