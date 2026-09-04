"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Check, Send, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useDemo } from "@/components/demo-provider";
import { extractIntake } from "@/lib/ai/intake-extraction";

type Message = { role: "ai" | "user"; text: string };

export default function IntakePage() {
  const router = useRouter();
  const { careRequest, setCareRequest } = useDemo();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "ai", text: "What can we help you with today? Describe what’s been going on in your own words." }]);
  const [stage, setStage] = useState(0);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.trim()) return;
    const next = extractIntake(input, { ...careRequest, concern: stage === 0 ? "" : careRequest.concern, duration: stage === 0 ? "" : careRequest.duration, emergencyWarning: false });
    setCareRequest(next);
    setMessages((items) => [...items, { role: "user", text: input }, { role: "ai", text: next.emergencyWarning ? "I’m going to pause this intake because your response may need immediate professional attention." : "Thank you. I’ve organized the main details below. A few preferences will help me find a better match." }]);
    setInput("");
    setStage(1);
  }

  function loadDemo() {
    const text = "I've had a cough for about four days and want to get checked in Bentonville after 3 PM.";
    const next = extractIntake(text, { ...careRequest, concern: "", duration: "", emergencyWarning: false });
    setCareRequest(next);
    setMessages((items) => [...items, { role: "user", text }, { role: "ai", text: "Thanks, Jordan. I’ve organized your request. Choose the preferences that work best for you." }]);
    setStage(1);
  }

  function updatePreference(field: "format" | "availability", value: string) {
    setCareRequest({ ...careRequest, [field]: value });
  }

  return <AppShell role="patient"><PageHeader eyebrow="Guided care request" title="Let’s find the right next step" description="Share only what you’re comfortable providing. CareFlow organizes information for navigation and scheduling—it does not diagnose." />
    {careRequest.emergencyWarning && <section className="notice notice-danger" style={{ marginBottom: 20 }} role="alert"><ShieldAlert size={22} /><div><strong>Immediate professional attention may be needed</strong><div style={{ marginTop: 4 }}>Based on what you entered, this request requires immediate professional attention. CareFlow cannot evaluate emergencies. Call 911 or go to the nearest emergency department if you may be experiencing an emergency. If you are in the U.S. and thinking about self-harm, call or text 988.</div></div></section>}
    <div className="intake-layout">
      <section className="card chat-card" aria-label="Conversational intake">
        <div className="chat-head"><div className="assistant-id"><div className="assistant-mark"><Bot size={19} /></div><div><strong>CareFlow guide</strong><div className="small muted">Navigation assistant · Not a clinician</div></div></div><span className="badge badge-green"><span className="dot" /> Secure demo</span></div>
        <div className="messages" aria-live="polite">
          {messages.map((message, index) => <div key={index} className={`message message-${message.role}`}>{message.text}</div>)}
          {stage === 0 && <div className="quick-replies"><button className="chip" onClick={loadDemo}>Use Jordan’s demo request</button><button className="chip" onClick={() => setInput("I need a routine check-up")}>Routine check-up</button><button className="chip" onClick={() => setInput("I prefer a telehealth visit")}>Prefer telehealth</button></div>}
          {stage > 0 && !careRequest.emergencyWarning && <><div className="message message-ai">How would you prefer to meet?</div><div className="quick-replies">{["In person", "Telehealth"].map((value) => <button key={value} className={`chip ${careRequest.format === value ? "selected" : ""}`} onClick={() => updatePreference("format", value)}>{value}</button>)}</div><div className="message message-ai">When are you generally available?</div><div className="quick-replies">{["After 3:00 PM", "Morning", "Flexible"].map((value) => <button key={value} className={`chip ${careRequest.availability === value ? "selected" : ""}`} onClick={() => updatePreference("availability", value)}>{value}</button>)}</div><button className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: 8 }} onClick={() => router.push("/patient/care-result")}>See my next step <ArrowRight size={16} /></button></>}
        </div>
        <form className="chat-compose" onSubmit={submit}><label className="sr-only" htmlFor="care-message">Describe what you need care for</label><input id="care-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Describe what you need help with…" /><button className="btn btn-primary" type="submit" aria-label="Send message"><Send size={16} /></button></form>
      </section>
      <aside className="card card-pad request-card"><div className="section-head"><div><div className="eyebrow">Your care request</div><h2 className="section-title" style={{ marginTop: 7 }}>What we’ve heard</h2></div><span className="badge badge-green"><Check size={12} /> Updating</span></div><div className="request-list">{[["Reason for visit", careRequest.concern], ["Duration", careRequest.duration], ["Preferred visit", careRequest.format], ["Location", careRequest.location], ["Availability", careRequest.availability], ["Insurance", careRequest.insurance], ["Accessibility", careRequest.accessibility.length ? careRequest.accessibility.join(", ") : "No needs added"]].map(([label, value]) => <div className="request-item" key={label}><span>{label}</span><strong>{value || "Not collected"}</strong></div>)}</div><div className="notice notice-info" style={{ marginTop: 18 }}><ShieldAlert size={17} /><span>Emergency warning checks are deterministic and separate from generative AI.</span></div></aside>
    </div>
  </AppShell>;
}
