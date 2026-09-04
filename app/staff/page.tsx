"use client";

import Link from "next/link";
import { AlertCircle, CalendarCheck, CalendarDays, Check, ClipboardList, FileWarning, RefreshCcw, UserCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { PatientTable } from "@/components/patient-table";
import { staffTasks } from "@/lib/demo-data";
import { useDemo } from "@/components/demo-provider";

export default function StaffDashboard() {
  const { demoState } = useDemo();
  return <AppShell role="staff"><PageHeader eyebrow="Ozark Grove Family Clinic · Demo" title="Today’s operations" description="Friday, September 4 · Centralized preparation and scheduling visibility." actions={<><button className="btn btn-secondary"><CalendarDays size={16} /> View schedule</button><Link href="/staff/tasks" className="btn btn-primary"><ClipboardList size={16} /> Review tasks</Link></>} />
    {demoState.preparationComplete && <div className="notice notice-info" style={{ marginBottom: 18 }}><Check size={18} /><span><strong>Jordan Lee is now Ready.</strong> Completed pre-visit information and the provider brief are available.</span></div>}
    <div className="metric-grid"><MetricCard icon={CalendarCheck} value="18" label="Appointments today" /><MetricCard icon={UserCheck} value={demoState.preparationComplete ? "13" : "12"} label="Patients ready" /><MetricCard icon={FileWarning} value={demoState.preparationComplete ? "2" : "3"} label="Forms incomplete" /><MetricCard icon={CalendarDays} value="4" label="Open slots" /><MetricCard icon={RefreshCcw} value="7" label="Want an earlier visit" /></div>
    <div className="grid-2" style={{ marginTop: 24 }}><section className="card"><div className="card-pad section-head" style={{ margin: 0 }}><div><h2 className="section-title">Today’s patients</h2><p className="small muted">Preparation state updates across the demo flow.</p></div><Link className="btn btn-secondary" href="/staff/patients">View all</Link></div><PatientTable /></section><aside className="card card-pad"><div className="section-head"><div><h2 className="section-title">Attention needed</h2><p className="small muted">Ordered by operational urgency</p></div><span className="badge badge-amber">5 tasks</span></div><div className="action-list">{staffTasks.slice(0, 4).map((task) => <div className="action-row" key={task.id}>{task.priority === "high" ? <AlertCircle size={18} /> : <ClipboardList size={18} />}<div><strong>{task.label}</strong><span>{task.detail}</span></div></div>)}</div><Link className="btn btn-secondary btn-block" href="/staff/tasks">Open task queue</Link></aside></div>
    <section className="card card-pad" style={{ marginTop: 24 }}><div className="section-head"><div><h2 className="section-title">Cancellation recovery</h2><p className="small muted">Tomorrow · 2:00 PM · Primary care</p></div><span className="badge badge-green"><span className="dot" /> 3 eligible patients</span></div><div style={{ display: "flex", alignItems: "center", gap: 15, flexWrap: "wrap" }}><div className="info-icon"><RefreshCcw size={18} /></div><div style={{ flex: 1, minWidth: 240 }}><strong>Open slot matched automatically</strong><div className="small muted">Eligibility considers visit type, provider compatibility, availability, distance, and access needs.</div></div><Link className="btn btn-primary" href="/staff/waitlist">Review eligible patients</Link></div></section>
  </AppShell>;
}
