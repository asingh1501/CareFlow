"use client";

import { useParams } from "next/navigation";
import { Accessibility, Bell, CalendarDays, Check, ClipboardCheck, CreditCard, FileText, MessageSquare, RefreshCcw, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/progress";
import { StatusBadge } from "@/components/status-badge";
import { useDemo } from "@/components/demo-provider";
import { patients } from "@/lib/demo-data";

export default function StaffPatientDetailPage() {
  const params = useParams<{ id: string }>();
  const { demoState, showToast, updateDemoState } = useDemo();
  const patient = patients.find((item) => item.id === params.id);
  if (!patient) return <AppShell role="staff"><PageHeader title="Patient not found" description="This synthetic patient record does not exist." /></AppShell>;

  const isJordan = patient.id === "jordan";
  const ready = isJordan ? demoState.preparationComplete : patient.status === "Ready";
  const reviewed = demoState.reviewedPatientIds.includes(patient.id);
  const percent = ready || patient.forms === "7 of 7" ? 100 : 43;
  const markReviewed = () => {
    if (reviewed) return;
    updateDemoState({ reviewedPatientIds: [...demoState.reviewedPatientIds, patient.id], ...(isJordan ? { jordanStatus: "Ready" as const } : {}) });
    showToast(`${patient.name}'s synthetic record marked reviewed`);
  };

  return <AppShell role="staff">
    <PageHeader eyebrow="Patient overview · Fictional data" title={patient.name} description={`${patient.time} · ${patient.provider} · Synthetic demo profile`} actions={<><button className="btn btn-secondary" disabled title="Sending reminders requires an authenticated messaging integration"><Bell size={15} /> Reminder unavailable</button><button className="btn btn-primary" disabled={reviewed} onClick={markReviewed}><Check size={15} /> {reviewed ? "Reviewed" : "Mark reviewed"}</button></>} />
    <div className="grid-2"><div className="stack">
      <section className="card"><div className="brief-header"><div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}><div><span className="eyebrow" style={{ color: "#a6d7c9" }}>Appointment</span><h2 style={{ margin: "9px 0 5px" }}>Today · {patient.time}</h2><p>{patient.provider} · Synthetic demo</p></div><StatusBadge tone={ready ? "green" : "amber"}>{ready ? "Ready" : patient.status}</StatusBadge></div></div><div className="brief-grid"><Brief label="Reason for visit" value={patient.reason} /><Brief label="Duration" value={isJordan ? "4 days" : "Not captured in this demo"} /><Brief label="Visit format" value={patient.reason.includes("Telehealth") ? "Telehealth" : "In person"} /><Brief label="Intake" value={patient.intake} /></div></section>
      <section className="card card-pad"><div className="section-head"><div><h2 className="section-title">Intake information</h2><p className="small muted">Patient-reported synthetic data</p></div><StatusBadge tone={patient.intake === "Complete" ? "green" : "amber"}>{patient.intake}</StatusBadge></div><div className="notice notice-info"><ShieldCheck size={17} />No emergency warning response is present in this synthetic record.</div><div className="request-list"><div className="request-item"><span>Reported concern</span><strong>{patient.reason}</strong></div><div className="request-item"><span>Provider</span><strong>{patient.provider}</strong></div><div className="request-item"><span>Appointment time</span><strong>{patient.time}</strong></div></div></section>
      <section className="card card-pad"><div className="section-head"><div><h2 className="section-title">Communication history</h2></div><button className="btn btn-secondary" disabled title="Messaging requires an authenticated clinic messaging integration"><MessageSquare size={15} /> Messaging unavailable</button></div><div className="info-list"><Info icon={Bell} title="No live messages connected" detail="Demo communication history only" /><Info icon={Check} title="Synthetic appointment listed" detail="No external confirmation was requested" /></div></section>
    </div><aside className="stack">
      <section className="card card-pad"><div className="section-head"><div><h2 className="section-title">Preparation</h2></div><strong style={{ color: "var(--green)" }}>{percent}%</strong></div><Progress value={percent} /><div className="info-list" style={{ marginTop: 12 }}><Info icon={ClipboardCheck} title={`Intake ${patient.intake.toLowerCase()}`} detail="Synthetic routing status" /><Info icon={FileText} title={ready ? "Forms complete" : `${patient.forms} forms complete`} detail="Synthetic preparation state" /><Info icon={CreditCard} title="Insurance not verified" detail="No eligibility service connected" /></div><button className="btn btn-secondary btn-block" disabled title="Sending requests requires an authenticated messaging integration">Request unavailable</button></section>
      <section className="card card-pad"><h2 className="section-title">Access needs</h2><div className="info-list"><Info icon={Accessibility} title="No access needs in demo record" detail="A production record requires authenticated retrieval" /></div></section>
      <section className="card card-pad"><h2 className="section-title">Staff actions</h2><div className="stack" style={{ gap: 9, marginTop: 15 }}><button className="btn btn-secondary btn-block" disabled title="Rescheduling requires a scheduling integration"><RefreshCcw size={15} /> Reschedule unavailable</button><button className="btn btn-secondary btn-block" disabled title="Internal notes require authenticated persistent storage"><FileText size={15} /> Notes unavailable</button><button className="btn btn-danger btn-block" disabled title="Cancellation requires a scheduling integration"><CalendarDays size={15} /> Cancellation unavailable</button></div></section>
    </aside></div>
  </AppShell>;
}

function Brief({ label, value }: { label: string; value: string }) { return <div className="brief-section"><div className="brief-label">{label}</div><div className="brief-value">{value}</div></div>; }
function Info({ icon: Icon, title, detail }: { icon: typeof Bell; title: string; detail: string }) { return <div className="info-row"><div className="info-icon"><Icon size={15} /></div><div><strong>{title}</strong><span>{detail}</span></div></div>; }
