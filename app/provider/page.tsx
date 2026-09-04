"use client";

import Link from "next/link";
import { CalendarCheck, Check, ClipboardCheck, Clock3, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { PatientTable } from "@/components/patient-table";
import { useDemo } from "@/components/demo-provider";

export default function ProviderDashboard() {
  const { demoState } = useDemo();
  return <AppShell role="provider"><PageHeader eyebrow="Provider workspace · Dr. Maya Patel" title="Today’s schedule" description="Patient-reported information is organized for review before each visit." actions={<Link className="btn btn-primary" href="/provider/patient/jordan"><ClipboardCheck size={16} /> Open next brief</Link>} /><div className="metric-grid" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}><MetricCard icon={CalendarCheck} value="9" label="Patients today" /><MetricCard icon={UsersRound} value={demoState.preparationComplete ? "7" : "6"} label="Ready for review" /><MetricCard icon={ClipboardCheck} value="2" label="Need review" /><MetricCard icon={Clock3} value="4:20" label="Next prepared visit" /></div><div className="grid-2" style={{ marginTop: 24 }}><section className="card"><div className="card-pad section-head" style={{ margin: 0 }}><div><h2 className="section-title">Upcoming patients</h2><p className="small muted">Select a patient to review the pre-visit brief.</p></div></div><PatientTable providerView /></section><aside className="stack"><section className="card card-pad"><span className="badge badge-green"><Check size={12} /> Next patient</span><h2 className="section-title" style={{ marginTop: 15 }}>Jordan Lee · 4:20 PM</h2><p className="small muted">Persistent cough · Patient-reported · {demoState.preparationComplete ? "Forms complete" : "Forms incomplete"}</p><Link className="btn btn-primary btn-block" href="/provider/patient/jordan">Review pre-visit brief</Link></section><section className="notice notice-info"><ClipboardCheck size={17} /><span>CareFlow summaries organize submitted information and missing items. They do not make clinical conclusions.</span></section></aside></div></AppShell>;
}
