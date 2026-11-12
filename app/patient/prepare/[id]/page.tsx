"use client";

import Link from "next/link";
import { Check, ChevronRight, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/progress";
import { useDemo } from "@/components/demo-provider";

const items = [
  { id: "reason", title: "Reason for visit", detail: "Persistent cough · 4 days" },
  { id: "basic", title: "Basic information", detail: "Contact and emergency contact" },
  { id: "appointment", title: "Appointment confirmation", detail: "Synthetic demo · 4:20 PM" },
  { id: "history", title: "Medical history", detail: "Existing conditions and relevant history" },
  { id: "medications", title: "Current medications & allergies", detail: "Include “none” when appropriate" },
  { id: "insurance", title: "Insurance information", detail: "Optional sample plan information" },
  { id: "consent", title: "Clinic forms & acknowledgment", detail: "Review how submitted information is used" },
];

export default function PreparePage() {
  const { demoState, updateDemoState, showToast } = useDemo();
  const completed = demoState.preparationComplete ? items.map((item) => item.id) : demoState.completedForms;
  const percent = Math.round((completed.length / items.length) * 100);
  const completeAll = () => { updateDemoState({ preparationComplete: true, completedForms: items.map((item) => item.id), jordanStatus: "Ready" }); showToast("Demo preparation complete — Jordan is now Ready"); };
  return <AppShell role="patient"><PageHeader eyebrow="Confirmed synthetic demo appointment" title="Prepare for your visit" description="Finish these demo steps so the presentation care team has organized information before arrival." actions={<StatusPill percent={percent} />} />
    <div className="grid-2"><div className="stack"><section className="card card-pad"><div className="section-head"><div><h2 className="section-title">Your preparation</h2><p className="small muted">{completed.length} of {items.length} steps complete</p></div><strong style={{ fontSize: 22, color: "var(--green)" }}>{percent}%</strong></div><Progress value={percent} /><div className="checklist" style={{ marginTop: 17 }}>{items.map((item) => { const done = completed.includes(item.id); return <div key={item.id} className="check-item"><div className={`checkmark ${done ? "done" : ""}`}>{done ? <Check size={16} /> : <FileText size={14} />}</div><div className="check-copy"><strong>{item.title}</strong><span>{item.detail}</span></div>{!done && <Link href="/patient/forms" className="icon-button" aria-label={`Complete ${item.title}`}><ChevronRight size={17} /></Link>}</div>; })}</div>{!demoState.preparationComplete && <button className="btn btn-primary btn-block" onClick={completeAll}>Complete remaining demo forms <Check size={16} /></button>}{demoState.preparationComplete && <div className="success-panel"><div className="success-icon"><Check size={23} /></div><strong>You’re ready for the demo visit</strong><p className="small muted">Submitted synthetic information is organized for the presentation care team.</p><Link className="btn btn-secondary" href="/staff">Continue demo in Staff View</Link></div>}</section></div><aside className="stack"><section className="card appointment-hero"><div><span className="eyebrow" style={{ color: "#a6d7c9" }}>Synthetic demo · 4:20 PM</span><h2 style={{ margin: "8px 0 5px", fontSize: 20 }}>Dr. Maya Patel (fictional)</h2><p className="small muted">Ozark Grove Family Clinic (fictional)<br />Bentonville, AR</p></div><div className="date-tile"><strong>DEMO</strong></div></section><section className="card card-pad"><div className="info-row"><div className="info-icon"><ClipboardCheck size={16} /></div><div><strong>What the demo clinic receives</strong><span>Your submitted answers, preparation status, and a concise patient-reported brief.</span></div></div><div className="info-row"><div className="info-icon"><ShieldCheck size={16} /></div><div><strong>Human review stays in control</strong><span>CareFlow does not make diagnoses or treatment decisions.</span></div></div></section></aside></div>
  </AppShell>;
}

function StatusPill({ percent }: { percent: number }) { return <span className={`badge ${percent === 100 ? "badge-green" : "badge-amber"}`}><span className="dot" />{percent === 100 ? "Ready" : "In progress"}</span>; }
