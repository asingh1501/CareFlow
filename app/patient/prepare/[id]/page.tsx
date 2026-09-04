"use client";

import Link from "next/link";
import { Check, ChevronRight, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/progress";
import { useDemo } from "@/components/demo-provider";

const items = [
  { id: "reason", title: "Reason for visit", detail: "Persistent cough · 4 days", automatic: true },
  { id: "basic", title: "Basic information", detail: "Contact and emergency contact", automatic: true },
  { id: "appointment", title: "Appointment confirmation", detail: "Today · 4:20 PM", automatic: true },
  { id: "history", title: "Medical history", detail: "Existing conditions and relevant history" },
  { id: "medications", title: "Current medications & allergies", detail: "Include “none” when appropriate" },
  { id: "insurance", title: "Insurance information", detail: "Optional sample plan information" },
  { id: "consent", title: "Clinic forms & acknowledgment", detail: "Review how submitted information is used" },
];

export default function PreparePage() {
  const { demoState, updateDemoState, showToast } = useDemo();
  const completed = demoState.preparationComplete ? items.map((item) => item.id) : demoState.completedForms;
  const percent = Math.round((completed.length / items.length) * 100);
  const completeAll = () => { updateDemoState({ preparationComplete: true, completedForms: items.map((item) => item.id), jordanStatus: "Ready" }); showToast("Preparation complete — Jordan is now Ready"); };
  return <AppShell role="patient"><PageHeader eyebrow="Appointment confirmed" title="Prepare for your visit" description="Finish these steps now so your care team has organized information before you arrive." actions={<StatusPill percent={percent} />} />
    <div className="grid-2"><div className="stack"><section className="card card-pad"><div className="section-head"><div><h2 className="section-title">Your preparation</h2><p className="small muted">{completed.length} of {items.length} steps complete</p></div><strong style={{ fontSize: 22, color: "var(--green)" }}>{percent}%</strong></div><Progress value={percent} /><div className="checklist" style={{ marginTop: 17 }}>{items.map((item) => { const done = completed.includes(item.id); return <Link href={done ? "#" : "/patient/forms"} key={item.id} className="check-item"><div className={`checkmark ${done ? "done" : ""}`}>{done ? <Check size={16} /> : <FileText size={14} />}</div><div className="check-copy"><strong>{item.title}</strong><span>{item.detail}</span></div>{!done && <ChevronRight size={17} className="muted" />}</Link>; })}</div>{!demoState.preparationComplete && <button className="btn btn-primary btn-block" onClick={completeAll}>Complete remaining demo forms <Check size={16} /></button>}{demoState.preparationComplete && <div className="success-panel"><div className="success-icon"><Check size={23} /></div><strong>You’re ready for your visit</strong><p className="small muted">Your submitted information is organized and available to the care team.</p><Link className="btn btn-secondary" href="/staff">Continue demo in Staff View</Link></div>}</section></div><aside className="stack"><section className="card appointment-hero"><div><span className="eyebrow" style={{ color: "#a6d7c9" }}>Today · 4:20 PM</span><h2 style={{ margin: "8px 0 5px", fontSize: 20 }}>Dr. Maya Patel</h2><p className="small muted">Ozark Grove Family Clinic<br />410 Sample Way, Bentonville</p></div><div className="date-tile"><strong>04</strong><span className="small">SEPTEMBER</span></div></section><section className="card card-pad"><div className="info-row"><div className="info-icon"><ClipboardCheck size={16} /></div><div><strong>What the clinic receives</strong><span>Your submitted answers, preparation status, and a concise patient-reported brief.</span></div></div><div className="info-row"><div className="info-icon"><ShieldCheck size={16} /></div><div><strong>Human review stays in control</strong><span>CareFlow does not make diagnoses or treatment decisions.</span></div></div></section></aside></div>
  </AppShell>;
}

function StatusPill({ percent }: { percent: number }) { return <span className={`badge ${percent === 100 ? "badge-green" : "badge-amber"}`}><span className="dot" />{percent === 100 ? "Ready" : "In progress"}</span>; }
