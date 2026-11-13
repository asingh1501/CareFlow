"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Check,
  CirclePause,
  CirclePlay,
  HeartPulse,
  MapPin,
  MousePointer2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { useDemo } from "@/components/demo-provider";
import type { PatientRecord } from "@/lib/types";

type DemoStatus = "idle" | "running" | "paused" | "completed" | "error";
type StageKey = "intro" | "dashboard" | "ai" | "providers" | "appointments" | "profile" | "closing";

const stageCopy: Record<StageKey, { label: string; caption: string; progress: number }> = {
  intro: { label: "Welcome", caption: "Discover care. Find specialists. Manage your health.", progress: 3 },
  dashboard: { label: "Dashboard", caption: "Your healthcare journey, all in one place.", progress: 13 },
  ai: { label: "Find Care AI", caption: "Get personalized navigation guidance with AI.", progress: 31 },
  providers: { label: "Provider search", caption: "Find the right care, wherever you are.", progress: 55 },
  appointments: { label: "Appointments", caption: "Healthcare that fits your schedule.", progress: 73 },
  profile: { label: "Health profile", caption: "Your health information, organized.", progress: 89 },
  closing: { label: "Complete", caption: "Smarter Care. Simpler Connections.", progress: 100 },
};

const demoRecords: PatientRecord[] = [
  { id: "demo-history-allergies", category: "allergy", title: "Seasonal allergies (demo)", date: "2025-04-12", details: "Patient-entered synthetic demonstration record.", source: "patient-entered" },
  { id: "demo-history-medication", category: "medication", title: "Daily multivitamin (demo)", details: "Patient-entered synthetic demonstration record.", source: "patient-entered" },
  { id: "demo-lab-wellness", category: "lab", title: "Synthetic wellness panel", date: "2025-08-18", details: "Demonstration result only — no clinical values or real patient data.", source: "patient-entered" },
];

class DemoStopped extends Error {}

export function AutomatedDemo() {
  const router = useRouter();
  const { resetDemo, updateDemoState } = useDemo();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const runIdRef = useRef(0);
  const pausedRef = useRef(false);
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<StageKey>("intro");
  const [progress, setProgress] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState({ x: 80, y: 120, visible: false, clicking: false });
  const [timeScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const value = Number(new URLSearchParams(window.location.search).get("speed") || "1");
    return Number.isFinite(value) ? Math.min(1, Math.max(0.05, value)) : 1;
  });

  useEffect(() => {
    setReady(true);
    return () => { runIdRef.current += 1; };
  }, []);

  const assertRun = useCallback((runId: number) => {
    if (runIdRef.current !== runId) throw new DemoStopped();
  }, []);

  const waitRaw = useCallback(async (milliseconds: number, runId: number) => {
    let remaining = milliseconds;
    while (remaining > 0) {
      assertRun(runId);
      if (pausedRef.current) {
        await new Promise((resolve) => window.setTimeout(resolve, 80));
        continue;
      }
      const slice = Math.min(remaining, 80);
      await new Promise((resolve) => window.setTimeout(resolve, slice));
      remaining -= slice;
    }
  }, [assertRun]);

  const wait = useCallback((milliseconds: number, runId: number) => waitRaw(milliseconds * timeScale, runId), [timeScale, waitRaw]);

  const frameWindow = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) throw new Error("The CareFlow application viewport is unavailable.");
    return frame.contentWindow;
  }, []);

  const frameDocument = useCallback(() => {
    const document = frameWindow().document;
    if (!document) throw new Error("The CareFlow application could not be accessed.");
    return document;
  }, [frameWindow]);

  const waitForPath = useCallback(async (pathname: string, runId: number, timeout = 10_000) => {
    const started = performance.now();
    while (performance.now() - started < timeout) {
      assertRun(runId);
      if (frameWindow().location.pathname === pathname && frameWindow().document.readyState !== "loading") return;
      await waitRaw(70, runId);
    }
    throw new Error(`The demo could not open ${pathname}.`);
  }, [assertRun, frameWindow, waitRaw]);

  const waitForSelector = useCallback(async <T extends Element>(selector: string, runId: number, timeout = 10_000): Promise<T> => {
    const started = performance.now();
    while (performance.now() - started < timeout) {
      assertRun(runId);
      const element = frameDocument().querySelector<T>(selector);
      if (element) return element;
      await waitRaw(70, runId);
    }
    throw new Error(`The demo could not find ${selector}.`);
  }, [assertRun, frameDocument, waitRaw]);

  const waitForText = useCallback(async (text: string, runId: number, timeout = 12_000) => {
    const started = performance.now();
    while (performance.now() - started < timeout) {
      assertRun(runId);
      if (frameDocument().body?.innerText.includes(text)) return;
      await waitRaw(80, runId);
    }
    throw new Error(`CareFlow did not display “${text}” in time.`);
  }, [assertRun, frameDocument, waitRaw]);

  const findByText = useCallback(async (selector: string, text: string, runId: number, timeout = 10_000): Promise<HTMLElement> => {
    const started = performance.now();
    while (performance.now() - started < timeout) {
      assertRun(runId);
      const match = Array.from(frameDocument().querySelectorAll<HTMLElement>(selector)).find((element) => element.innerText.trim().includes(text));
      if (match) return match;
      await waitRaw(70, runId);
    }
    throw new Error(`The demo could not find “${text}”.`);
  }, [assertRun, frameDocument, waitRaw]);

  const pointTo = useCallback(async (element: Element, runId: number) => {
    assertRun(runId);
    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    await wait(240, runId);
    const frameRect = iframeRef.current?.getBoundingClientRect();
    const targetRect = element.getBoundingClientRect();
    if (!frameRect) throw new Error("The demo viewport moved unexpectedly.");
    setCursor({ x: frameRect.left + targetRect.left + targetRect.width / 2, y: frameRect.top + targetRect.top + targetRect.height / 2, visible: true, clicking: false });
    await wait(420, runId);
  }, [assertRun, wait]);

  const clickElement = useCallback(async (element: HTMLElement, runId: number) => {
    await pointTo(element as HTMLElement, runId);
    element.classList.add("demo-target-active");
    setCursor((value) => ({ ...value, clicking: true }));
    await wait(140, runId);
    element.click();
    await wait(220, runId);
    setCursor((value) => ({ ...value, clicking: false }));
    element.classList.remove("demo-target-active");
  }, [pointTo, wait]);

  const click = useCallback(async (selector: string, runId: number) => {
    await clickElement(await waitForSelector<HTMLElement>(selector, runId), runId);
  }, [clickElement, waitForSelector]);

  const clickText = useCallback(async (selector: string, text: string, runId: number) => {
    await clickElement(await findByText(selector, text, runId), runId);
  }, [clickElement, findByText]);

  const setNativeValue = useCallback((element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) => {
    const ownerWindow = element.ownerDocument.defaultView;
    if (!ownerWindow) return;
    const prototype = element instanceof ownerWindow.HTMLTextAreaElement
      ? ownerWindow.HTMLTextAreaElement.prototype
      : element instanceof ownerWindow.HTMLSelectElement
        ? ownerWindow.HTMLSelectElement.prototype
        : ownerWindow.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(element, value);
    element.dispatchEvent(new ownerWindow.Event("input", { bubbles: true }));
    element.dispatchEvent(new ownerWindow.Event("change", { bubbles: true }));
  }, []);

  const typeInto = useCallback(async (selector: string, value: string, runId: number) => {
    const element = await waitForSelector<HTMLInputElement | HTMLTextAreaElement>(selector, runId);
    await pointTo(element, runId);
    element.focus();
    setNativeValue(element, "");
    for (const character of value) {
      assertRun(runId);
      setNativeValue(element, element.value + character);
      await waitRaw(28 * timeScale, runId);
    }
    await wait(180, runId);
  }, [assertRun, pointTo, setNativeValue, timeScale, wait, waitForSelector, waitRaw]);

  const choose = useCallback(async (selector: string, value: string, runId: number) => {
    const element = await waitForSelector<HTMLElement>(selector, runId) as HTMLInputElement | HTMLSelectElement;
    await pointTo(element as HTMLElement, runId);
    setNativeValue(element, value);
    await wait(180, runId);
  }, [pointTo, setNativeValue, wait, waitForSelector]);

  const setStageState = useCallback((next: StageKey) => {
    setStage(next);
    setProgress(stageCopy[next].progress);
  }, []);

  const runDemo = useCallback(async () => {
    const runId = ++runIdRef.current;
    pausedRef.current = false;
    setStatus("running");
    setStage("intro");
    setProgress(2);
    setShowIntro(true);
    setShowClosing(false);
    setError("");
    setCursor({ x: 80, y: 120, visible: false, clicking: false });
    resetDemo({ silent: true });
    updateDemoState({ records: demoRecords });
    window.sessionStorage.removeItem("careflow-chat");
    const startedAt = performance.now();

    try {
      frameWindow().location.replace(`/patient?demoRun=${runId}`);
      await waitForPath("/patient", runId);
      await wait(3_350, runId);

      setShowIntro(false);
      setStageState("dashboard");
      await waitForSelector(".page-main", runId);
      await wait(1_750, runId);
      await click(".page-main a[href='/patient/intake']", runId);
      await waitForPath("/patient/intake", runId);

      setStageState("ai");
      await typeInto("#care-message", "I'm looking for a cardiologist near me.", runId);
      await click("button[aria-label='Send message']", runId);
      await waitForText("Demo navigation captured Cardiology", runId);
      await wait(4_900, runId);
      await click(".request-card a[href='/patient/providers']", runId);
      await waitForPath("/patient/providers", runId);

      setStageState("providers");
      await choose("#provider-specialty", "Cardiology", runId);
      await choose("#provider-radius", "100", runId);
      await click(".provider-search-form .btn-primary", runId);
      await waitForText("Ozark Heart Group (Demo)", runId);
      await clickText(".provider-result button", "Provider details", runId);
      await waitForText("Directory details", runId);
      await wait(4_000, runId);
      await click(".provider-result a[href='/patient/appointments']", runId);
      await waitForPath("/patient/appointments", runId);

      setStageState("appointments");
      await clickText("button", "Change preferences", runId);
      await waitForSelector("[role='dialog']", runId);
      await choose("#pref-specialty", "Primary Care", runId);
      await choose("#pref-radius", "100", runId);
      await choose("#pref-time", "After 3:00 PM", runId);
      await clickText("[role='dialog'] button", "Save preferences", runId);
      await waitForText("Preferences saved and recommendations refreshed", runId);
      await wait(3_250, runId);
      await click(".desktop-nav a[href='/patient/profile']", runId);
      await waitForPath("/patient/profile", runId);

      setStageState("profile");
      await clickText(".profile-tabs button", "Medical history", runId);
      await waitForText("Seasonal allergies (demo)", runId);
      await wait(1_900, runId);
      await clickText(".profile-tabs button", "Lab results", runId);
      await waitForText("Synthetic wellness panel", runId);
      await wait(2_250, runId);

      setStageState("closing");
      setCursor((value) => ({ ...value, visible: false }));
      setShowClosing(true);
      const minimumRuntime = 39_000 * timeScale;
      const elapsed = performance.now() - startedAt;
      if (elapsed < minimumRuntime) await waitRaw(minimumRuntime - elapsed, runId);
      await wait(2_500, runId);
      assertRun(runId);
      setStatus("completed");
      setProgress(100);
    } catch (reason) {
      if (reason instanceof DemoStopped) return;
      setStatus("error");
      setError(reason instanceof Error ? reason.message : "The automated demo stopped unexpectedly.");
      setCursor((value) => ({ ...value, visible: false }));
    }
  }, [assertRun, choose, click, clickText, frameWindow, resetDemo, setStageState, timeScale, typeInto, updateDemoState, wait, waitForPath, waitForSelector, waitForText, waitRaw]);

  function pauseDemo() {
    if (status !== "running") return;
    pausedRef.current = true;
    setStatus("paused");
  }

  function resumeDemo() {
    if (status !== "paused") return;
    pausedRef.current = false;
    setStatus("running");
  }

  function exitDemo() {
    runIdRef.current += 1;
    pausedRef.current = false;
    router.push("/patient");
  }

  return (
    <main className={`automated-demo ${status !== "idle" ? "demo-theater-active" : ""}`} data-demo-status={status} data-demo-stage={stage}>
      <section className="demo-landing" aria-hidden={status !== "idle"}>
        <header className="demo-landing-nav"><Brand /><Link className="btn btn-secondary" href="/">Back to overview</Link></header>
        <div className="demo-landing-grid">
          <div className="demo-landing-copy">
            <div className="demo-kicker"><Sparkles size={15} /> Automated product tour</div>
            <h1>Experience <span>CareFlow</span></h1>
            <p>See how CareFlow simplifies finding and managing healthcare—through the real application, in about 40 seconds.</p>
            <div className="demo-landing-actions"><button className="btn btn-primary demo-start" disabled={!ready} onClick={() => void runDemo()}><CirclePlay size={19} fill="currentColor" /> Start Demo</button><span><ShieldCheck size={16} /> Isolated synthetic data</span></div>
            <div className="demo-feature-row" aria-label="Demo features"><span><Bot size={17} /> Find Care AI</span><span><MapPin size={17} /> Provider search</span><span><UserRound size={17} /> Health profile</span></div>
          </div>
          <div className="demo-preview" aria-label="CareFlow demo preview">
            <div className="demo-preview-glow" />
            <div className="demo-preview-window"><div className="demo-preview-top"><span /><span /><span /><strong>careflow-ar.vercel.app</strong></div><div className="demo-preview-body"><div className="demo-preview-brand"><HeartPulse size={20} /><strong>CareFlow</strong><small>CARE COORDINATION</small></div><div className="demo-preview-title">Your healthcare journey,<br />all in one place.</div><div className="demo-preview-cards"><div><Search size={22} /><strong>Find care</strong><small>Conversational guidance</small></div><div><Stethoscope size={22} /><strong>Specialists</strong><small>Search across state lines</small></div></div><div className="demo-preview-cursor"><MousePointer2 size={24} fill="white" /></div></div></div>
          </div>
        </div>
        <footer className="demo-landing-footer"><span>Synthetic demonstration · No real patient records · No external bookings</span><span>01 — 06</span></footer>
      </section>

      <section className="demo-theater" aria-hidden={status === "idle"}>
        <header className="demo-theater-header">
          <div className="demo-theater-brand"><HeartPulse size={18} /><strong>CareFlow</strong><span>LIVE PRODUCT DEMO</span></div>
          <div className="demo-theater-step"><small>{stageCopy[stage].label}</small><strong>{stageCopy[stage].caption}</strong></div>
          <div className="demo-theater-controls">
            {status === "running" && <button onClick={pauseDemo} aria-label="Pause Demo"><CirclePause size={18} /> Pause</button>}
            {status === "paused" && <button onClick={resumeDemo} aria-label="Resume Demo"><CirclePlay size={18} /> Resume</button>}
            {(status === "completed" || status === "error") && <button onClick={() => void runDemo()} aria-label="Replay Demo"><RefreshCcw size={17} /> Replay</button>}
            <button onClick={exitDemo} aria-label="Exit Demo"><X size={18} /> Exit</button>
          </div>
          <div className="demo-theater-progress" role="progressbar" aria-label="Demo progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
        </header>

        <div className="demo-frame-wrap">
          <iframe ref={iframeRef} className="demo-app-frame" src="/patient" title="CareFlow live application" tabIndex={-1} />
          <div className={`demo-intro-screen ${showIntro ? "visible" : ""}`}><div className="demo-intro-mark"><HeartPulse size={34} /></div><div className="demo-intro-kicker">Care coordination, reimagined</div><h2>CareFlow — Healthcare, Simplified.</h2><p>Discover care. Find specialists. Manage your health.</p></div>
          <div className={`demo-closing-screen ${showClosing ? "visible" : ""}`}><div className="demo-intro-mark"><Check size={34} /></div><div className="demo-intro-kicker">That’s CareFlow</div><h2>Smarter Care.<br />Simpler Connections.</h2><p>One guided experience from care discovery to preparation.</p>{status === "completed" && <div className="demo-complete-actions"><button className="btn btn-primary" onClick={() => void runDemo()}><RefreshCcw size={17} /> Replay Demo</button><button className="btn btn-secondary" onClick={exitDemo}>Enter CareFlow <ArrowRight size={16} /></button></div>}</div>
          {status === "paused" && <div className="demo-pause-screen"><CirclePause size={35} /><strong>Demo paused</strong><span>Resume when you’re ready.</span></div>}
          {status === "error" && <div className="demo-error-screen" role="alert"><strong>The demo needs another try.</strong><span>{error}</span><button className="btn btn-primary" onClick={() => void runDemo()}><RefreshCcw size={16} /> Restart Demo</button></div>}
          <div className={`demo-cursor ${cursor.visible ? "visible" : ""} ${cursor.clicking ? "clicking" : ""}`} style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }} aria-hidden="true"><MousePointer2 size={25} fill="white" /><span /></div>
          <div className="demo-caption"><small>{String(Object.keys(stageCopy).indexOf(stage) + 1).padStart(2, "0")} / 07</small><strong>{stageCopy[stage].caption}</strong><span>SYNTHETIC DEMO</span></div>
        </div>
      </section>
    </main>
  );
}
