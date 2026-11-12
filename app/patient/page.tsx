"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Check, ClipboardCheck, ListRestart, MapPin, MessageSquare, Search, Stethoscope } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/progress";
import { StatusBadge } from "@/components/status-badge";
import { useDemo } from "@/components/demo-provider";

export default function PatientDashboard() {
  const { demoState } = useDemo();
  const percent = demoState.preparationComplete ? 100 : Math.round((demoState.completedForms.length / 7) * 100);
  return <AppShell role="patient"><PageHeader title="Good afternoon, Jordan" description="Here’s what’s next in your care journey." actions={<Link className="btn btn-primary" href="/patient/intake"><Search size={16} /> Find care</Link>} />
    <div className="grid-2">
      <div className="stack">
        <section className="card appointment-hero"><div><span className="eyebrow" style={{ color: "#a6d7c9" }}>Upcoming appointment</span><h2 style={{ margin: "9px 0 6px", fontSize: 24 }}>Primary care with Dr. Maya Patel</h2><p className="muted small">Ozark Grove Family Clinic · Bentonville, AR</p><div className="inline-actions" style={{ marginTop: 20 }}><Link className="btn btn-secondary" href="/patient/appointments/demo">View details</Link><Link className="btn btn-primary" style={{ background: "white", color: "#173d36" }} href="/patient/prepare/demo">Prepare for visit <ArrowRight size={15} /></Link></div></div><div className="date-tile"><span className="small">TODAY</span><strong>4:20</strong><span className="small">PM</span></div></section>
        <section className="card card-pad"><div className="section-head"><div><h2 className="section-title">Preparation progress</h2><p className="small muted">Complete information before you arrive.</p></div><strong style={{ color: "var(--green)" }}>{percent}%</strong></div><Progress value={percent} /><div className="info-list" style={{ marginTop: 15 }}><div className="info-row"><div className="info-icon"><Check size={15} /></div><div><strong>Care request organized</strong><span>Reason for visit and preferences captured</span></div></div><div className="info-row"><div className="info-icon"><ClipboardCheck size={15} /></div><div><strong>{demoState.preparationComplete ? "All forms complete" : "4 items need attention"}</strong><span>{demoState.preparationComplete ? "You’re ready for your visit" : "Medical history, medications, insurance, clinic forms"}</span></div></div></div></section>
        <section><div className="section-head"><div><h2 className="section-title">Quick actions</h2></div></div><div className="quick-actions"><Link href="/patient/intake" className="quick-action"><Search size={20} /><span>Find care</span></Link><Link href="/patient/appointments" className="quick-action"><CalendarClock size={20} /><span>Appointment options</span></Link><Link href="/patient/forms" className="quick-action"><ClipboardCheck size={20} /><span>Complete forms</span></Link><Link href="/patient/waitlist" className="quick-action"><ListRestart size={20} /><span>Join waitlist</span></Link><button className="quick-action" disabled title="Clinic messaging requires an external messaging integration"><MessageSquare size={20} /><span>Messaging unavailable</span></button></div></section>
      </div>
      <aside className="stack">
        <section className="card card-pad"><div className="section-head"><div><h2 className="section-title">Messages</h2></div><span className="badge badge-gray">2</span></div><div className="info-list"><div className="info-row"><div className="info-icon"><ClipboardCheck size={15} /></div><div><strong>Complete your history</strong><span>It should take about 3 minutes · 12 min ago</span></div></div><div className="info-row"><div className="info-icon"><MessageSquare size={15} /></div><div><strong>Appointment confirmed</strong><span>Today at 4:20 PM · Yesterday</span></div></div></div></section>
        <section className="card card-pad"><div className="section-head"><div><h2 className="section-title">Waitlist status</h2><p className="small muted">Earlier-appointment preferences</p></div><StatusBadge tone="green">Active</StatusBadge></div><div className="notice notice-info"><CalendarClock size={17} /><span>We’ll only offer openings that match your visit type, availability, and travel preference.</span></div><Link className="btn btn-secondary btn-block" style={{ marginTop: 14 }} href="/patient/waitlist">Manage waitlist</Link></section>
        <section className="card card-pad"><h2 className="section-title">Recent care</h2><div className="info-list" style={{ marginTop: 10 }}><div className="info-row"><div className="info-icon"><Stethoscope size={15} /></div><div><strong>Annual visit</strong><span>May 12 · Sample record</span></div></div><div className="info-row"><div className="info-icon"><MapPin size={15} /></div><div><strong>Rogers clinic visit</strong><span>Feb 03 · Sample record</span></div></div></div></section>
      </aside>
    </div>
  </AppShell>;
}
