"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Bot, RefreshCcw, RotateCcw, Send, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useDemo } from "@/components/demo-provider";
import type { CareRequest } from "@/lib/types";

type Message = { role: "assistant" | "user"; content: string; urgent?: boolean };
const greeting: Message = { role: "assistant", content: "Hi, I’m CareFlow. Tell me what kind of care you’re looking for, where you’d like to search, or what’s making it hard to find the right appointment." };

export default function IntakePage() {
  const { careRequest, setCareRequest } = useDemo();
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [greeting];
    const saved = window.sessionStorage.getItem("careflow-chat");
    if (!saved) return [greeting];
    try { return JSON.parse(saved) as Message[]; } catch { return [greeting]; }
  });
  const [input, setInput] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastInput, setLastInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetch("/api/ai/status").then(async (response) => (await response.json()) as { configured: boolean }).then((state) => setConfigured(state.configured)).catch(() => setConfigured(false));
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); window.sessionStorage.setItem("careflow-chat", JSON.stringify(messages)); }, [messages, loading]);

  async function updateStructured(message: string): Promise<CareRequest> {
    const response = await fetch("/api/intake", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message, current: careRequest }) });
    const payload = await response.json() as { structured: CareRequest };
    if (response.ok) { setCareRequest(payload.structured); return payload.structured; }
    return careRequest;
  }

  async function sendMessage(raw = input) {
    const content = raw.trim();
    if (!content || loading) return;
    setLoading(true); setError(""); setLastInput(content); setInput("");
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    try {
      const structured = await updateStructured(content);
      if (configured !== true) {
        const reply = structured.emergencyWarning
          ? "Your message includes a warning sign CareFlow cannot safely evaluate. If this may be an emergency, call local emergency services or go to the nearest emergency department now. Automated scheduling is paused."
          : `Demo navigation captured ${structured.specialty || "your care need"} near ${structured.location || "your preferred location"}, with a ${structured.radiusMiles || 100}-mile radius. You can keep adding timing or telehealth preferences, or open matching demo providers.`;
        setMessages([...nextMessages, { role: "assistant", content: reply, urgent: structured.emergencyWarning }]);
      } else {
        const response = await fetch("/api/ai/chat", { method: "POST", headers: { "content-type": "application/json", accept: "text/plain" }, body: JSON.stringify({ messages: nextMessages.slice(-20).map(({ role, content: text }) => ({ role, content: text })) }) });
        if (!response.ok) { const payload = await response.json() as { error?: string }; throw new Error(payload.error || "CareFlow AI is unavailable."); }
        if (!response.body) throw new Error("CareFlow AI returned an empty response.");
        const reader = response.body.getReader(); const decoder = new TextDecoder(); let assistant = "";
        setMessages([...nextMessages, { role: "assistant", content: "" }]);
        while (true) { const { done, value } = await reader.read(); if (done) break; assistant += decoder.decode(value, { stream: true }); setMessages([...nextMessages, { role: "assistant", content: assistant }]); }
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The message could not be sent."); }
    finally { setLoading(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void sendMessage(); }
  function handleKey(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }
  function clearChat() { setMessages([greeting]); setError(""); window.sessionStorage.removeItem("careflow-chat"); }
  const enoughForSearch = Boolean(careRequest.location && careRequest.specialty);

  return <AppShell role="patient"><PageHeader eyebrow="Find Care AI" title="How can we help you find care?" description="Chat naturally about the care, location, timing, and access preferences you want. CareFlow navigates and coordinates—it does not diagnose." />
    <div className="intake-layout">
      <section className="card chat-card" aria-label="CareFlow conversation">
        <div className="chat-head"><div className="assistant-id"><div className="assistant-mark"><Bot size={19} /></div><div><strong>CareFlow guide</strong><div className="small muted">Navigation assistant · Not a clinician</div></div></div><div className="inline-actions"><span className={`badge ${configured ? "badge-green" : "badge-amber"}`}><span className="dot" />{configured === null ? "Checking service" : configured ? "Live AI" : "Demo navigation"}</span><button className="icon-button" onClick={clearChat} aria-label="Clear conversation"><RefreshCcw size={16} /></button></div></div>
        {configured === false && <div className="notice notice-warning chat-mode-notice"><ShieldAlert size={17} /><span><strong>Live AI is not configured.</strong> This clearly labeled demo mode uses deterministic extraction and does not pretend to be GPT. Add `OPENAI_API_KEY` server-side to enable live responses.</span></div>}
        <div className="messages" aria-live="polite" aria-busy={loading}>{messages.map((message, index) => <div key={`${index}-${message.role}`} className={`message message-${message.role === "assistant" ? "ai" : "user"} ${message.urgent ? "message-urgent" : ""}`}>{message.content || <span className="typing-dots" aria-label="CareFlow is responding">•••</span>}</div>)}{loading && messages.at(-1)?.role !== "assistant" && <div className="message message-ai"><span className="typing-dots" aria-label="CareFlow is thinking">•••</span></div>}<div ref={endRef} /></div>
        {error && <div className="notice notice-danger chat-error" role="alert"><span>{error}</span><button className="btn btn-secondary" onClick={() => void sendMessage(lastInput)}><RotateCcw size={14} /> Retry</button></div>}
        <form className="chat-compose" onSubmit={submit}><label className="sr-only" htmlFor="care-message">Message CareFlow</label><textarea id="care-message" rows={2} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKey} maxLength={4000} placeholder="Describe the care you’re looking for…" /><button className="btn btn-primary" type="submit" disabled={!input.trim() || loading} aria-label="Send message"><Send size={17} /></button></form>
      </section>
      <aside className="card card-pad request-card"><div className="eyebrow">Search preferences</div><h2 className="section-title" style={{ marginTop: 7 }}>From this conversation</h2><div className="request-list">{[["Care need", careRequest.concern], ["Specialty", careRequest.specialty], ["Location", careRequest.location], ["Travel radius", `${careRequest.radiusMiles || 100} miles`], ["Format", careRequest.format], ["Availability", careRequest.availability]].map(([label, value]) => <div className="request-item" key={label}><span>{label}</span><strong>{value || "Not collected"}</strong></div>)}</div>{enoughForSearch ? <Link className="btn btn-primary btn-block" style={{ marginTop: 18 }} href="/patient/providers">View matching providers</Link> : <p className="small muted" style={{ marginTop: 18 }}>Include a location and specialty to open matching provider search.</p>}<div className="notice notice-info" style={{ marginTop: 16 }}><ShieldAlert size={17} /><span>Emergency warning rules run separately before any model response.</span></div></aside>
    </div>
  </AppShell>;
}
