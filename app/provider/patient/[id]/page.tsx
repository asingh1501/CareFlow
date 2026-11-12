"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Check, ClipboardCheck, FileWarning, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useDemo } from "@/components/demo-provider";
import { buildPreVisitSummary } from "@/lib/ai/pre-visit-summary";
import { patients } from "@/lib/demo-data";

export default function ProviderBriefPage() {
  const params = useParams<{ id: string }>();
  const { careRequest, demoState, showToast, updateDemoState } = useDemo();
  const patient = patients.find((item) => item.id === params.id);
  if (!patient) return <AppShell role="provider"><PageHeader title="Patient not found" description="This synthetic patient record does not exist." /></AppShell>;

  const isJordan = patient.id === "jordan";
  const ready = isJordan ? demoState.preparationComplete : patient.status === "Ready";
  const reviewed = demoState.reviewedPatientIds.includes(patient.id);
  const brief = isJordan ? buildPreVisitSummary(careRequest) : null;
  const markReviewed = () => {
    if (reviewed) return;
    updateDemoState({ reviewedPatientIds: [...demoState.reviewedPatientIds, patient.id] });
    showToast(`${patient.name}'s synthetic brief marked reviewed`);
  };

  return <AppShell role="provider"><PageHeader eyebrow="Patient pre-visit brief · Fictional data" title={patient.name} description={`Today · ${patient.time} · ${patient.provider}`} actions={<><Link className="btn btn-secondary" href="/provider"><ArrowLeft size={15} /> Schedule</Link><button className="btn btn-primary" disabled={reviewed} onClick={markReviewed}><Check size={15} /> {reviewed ? "Reviewed" : "Mark reviewed"}</button></>} />
    <div className="grid-2"><article className="card"><div className="brief-header"><div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start" }}><div><span className="eyebrow" style={{ color: "#a6d7c9" }}>Patient-reported · Synthetic</span><h2 style={{ fontSize: 25, margin: "10px 0 7px" }}>{patient.reason}</h2><p>{brief?.summary || "This demo profile contains only the scheduling summary shown below; no clinician-authored record is connected."}</p></div><StatusBadge tone={ready ? "green" : "amber"}>{ready ? "Ready" : patient.status}</StatusBadge></div></div><div className="brief-grid"><Brief label="Reason for visit" value={patient.reason} /><Brief label="Duration" value={isJordan ? careRequest.duration : "Not captured in this demo"} /><Brief label="Reported concerns" value={isJordan ? `${careRequest.concern}; no clinical conclusion generated.` : `${patient.reason}; no clinical conclusion generated.`} /><Brief label="Visit preference" value={isJordan ? `${careRequest.format} · ${careRequest.availability}` : patient.reason.includes("Telehealth") ? "Telehealth" : "In person"} /><Brief label="Current medications" value={isJordan ? "Sample medication A (patient-reported)" : "Not provided in this demo"} /><Brief label="Allergies" value={isJordan ? "None reported" : "Not provided in this demo"} /><Brief label="Intake status" value={patient.intake} /><Brief label="Forms" value={isJordan && demoState.preparationComplete ? "Complete · 7 of 7" : patient.forms} /></div><div className="brief-section"><div className="brief-label">Safety-screening statement</div><div className="brief-value">{brief?.safetyStatement || "No safety-screening response is stored for this synthetic profile."}</div></div></article><aside className="stack"><section className="card card-pad"><div className="section-head"><div><h2 className="section-title">Items requiring review</h2></div><span className={`badge ${ready ? "badge-green" : "badge-amber"}`}>{ready ? "0" : "1"}</span></div>{ready ? <div className="notice notice-info"><Check size={17} />No preparation items are currently missing.</div> : <div className="notice notice-warning"><FileWarning size={17} />Preparation information is incomplete and requires human review.</div>}</section><section className="card card-pad"><h2 className="section-title">Summary boundaries</h2><div className="info-list"><div className="info-row"><div className="info-icon"><ClipboardCheck size={15} /></div><div><strong>Organizes patient reports</strong><span>Uses neutral language and highlights missing fields.</span></div></div><div className="info-row"><div className="info-icon"><ShieldCheck size={15} /></div><div><strong>No clinical assumptions</strong><span>No diagnosis, risk label, treatment suggestion, or final care decision.</span></div></div></div></section><Link href="/analytics" className="btn btn-secondary">Continue demo to analytics</Link></aside></div>
  </AppShell>;
}

function Brief({ label, value }: { label: string; value: string }) { return <div className="brief-section"><div className="brief-label">{label}</div><div className="brief-value">{value}</div></div>; }
